import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api';
import { useCart } from '../context/CartContext.jsx';
import SiteShell from '../components/SiteShell.jsx';
import { extractPhoneNumber, getTelegramUser, isContactSuccess } from '../utils/telegram.js';

const Checkout = () => {
  const navigate = useNavigate();
  const { items, total, clear } = useCart();

  const [telegramUser, setTelegramUser] = useState(() => getTelegramUser());
  const draft = useMemo(() => {
    if (typeof window === 'undefined') return {};
    try {
      return JSON.parse(localStorage.getItem('checkout_draft_v1') || '{}');
    } catch {
      return {};
    }
  }, []);

  const [phone, setPhone] = useState(() => localStorage.getItem('tg_phone') || draft.phone || '');
  const [phoneVerified, setPhoneVerified] = useState(() => localStorage.getItem('tg_phone_verified') === 'true');
  const [phoneSync, setPhoneSync] = useState('');
  const phoneSyncRef = useRef('');
  const phoneSyncTimer = useRef(null);

  useEffect(() => () => {
    if (phoneSyncTimer.current) {
      clearTimeout(phoneSyncTimer.current);
    }
  }, []);
  const [email, setEmail] = useState(draft.email || '');
  const [firstName, setFirstName] = useState(draft.firstName || '');
  const [lastName, setLastName] = useState(draft.lastName || '');
  const [city, setCity] = useState(draft.city || '');
  const [cityCode, setCityCode] = useState(draft.cityCode || '');
  const [deliveryProvider, setDeliveryProvider] = useState(draft.deliveryProvider || 'cdek');
  const [pvzList, setPvzList] = useState([]);
  const [pvzQuery, setPvzQuery] = useState('');
  const [selectedPvz, setSelectedPvz] = useState(draft.selectedPvz || '');
  const [pvzOpen, setPvzOpen] = useState(false);
  const [deliveryCost, setDeliveryCost] = useState(0);
  const [etaDays, setEtaDays] = useState(null);
  const [citySuggestions, setCitySuggestions] = useState([]);
  const [cityLoading, setCityLoading] = useState(false);
  const [settings, setSettings] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const deliveryOptions = useMemo(() => ([
    { id: 'cdek', label: 'СДЭК ПВЗ', enabled: settings?.deliveryCdekEnabled !== false },
    { id: 'yandex', label: 'Яндекс доставка', enabled: settings?.deliveryYandexEnabled === true }
  ]), [settings]);
  const enabledProviders = deliveryOptions.filter(option => option.enabled).map(option => option.id);
  const paymentYookassaEnabled = settings?.paymentYookassaEnabled !== false;
  const paymentLabel = settings?.paymentYookassaLabel || 'Оплатить через ЮKassa';
  const paymentImageUrl = settings?.paymentYookassaImageUrl || '';
  const filteredPvzList = useMemo(() => {
    if (!pvzQuery) return pvzList;
    const needle = pvzQuery.toLowerCase();
    return pvzList.filter(item => {
      const address = item.address || item.location?.address || item.code || item.id || '';
      return String(address).toLowerCase().includes(needle);
    });
  }, [pvzList, pvzQuery]);

  useEffect(() => {
    const timer = setTimeout(() => {
      const payload = {
        phone,
        email,
        firstName,
        lastName,
        city,
        cityCode,
        selectedPvz,
        deliveryProvider
      };
      localStorage.setItem('checkout_draft_v1', JSON.stringify(payload));
    }, 300);
    return () => clearTimeout(timer);
  }, [phone, email, firstName, lastName, city, cityCode, selectedPvz, deliveryProvider]);

  useEffect(() => {
    setPvzList([]);
    setSelectedPvz('');
    setPvzQuery('');
    setPvzOpen(false);
    setDeliveryCost(0);
    setEtaDays(null);
  }, [deliveryProvider]);

  useEffect(() => {
    const loadSettings = async () => {
      try {
        const res = await api.get('/api/settings', { params: { ts: Date.now() } });
        setSettings(res.data || null);
      } catch (err) {
        console.error(err);
      }
    };

    loadSettings();
  }, []);

  useEffect(() => {
    if (!enabledProviders.length) return;
    if (!enabledProviders.includes(deliveryProvider)) {
      setDeliveryProvider(enabledProviders[0]);
    }
  }, [enabledProviders, deliveryProvider]);

  const saveCustomer = async (phoneNumber, { silent = false, notify = false } = {}) => {
    if (!phoneNumber) return false;
    if (!silent) {
      setPhoneSync('saving');
    }
    try {
      const resolvedTelegram = telegramUser || getTelegramUser();
      await api.post('/api/customers', {
        phone: phoneNumber,
        telegram: resolvedTelegram ? {
          id: resolvedTelegram.id,
          username: resolvedTelegram.username,
          firstName: resolvedTelegram.first_name,
          lastName: resolvedTelegram.last_name
        } : undefined,
        notify
      });
      phoneSyncRef.current = phoneNumber;
      if (!silent) {
        setPhoneSync('saved');
        if (phoneSyncTimer.current) clearTimeout(phoneSyncTimer.current);
        phoneSyncTimer.current = setTimeout(() => setPhoneSync(''), 3000);
      }
      return true;
    } catch (err) {
      console.error(err);
      if (!silent) {
        setPhoneSync('error');
        if (phoneSyncTimer.current) clearTimeout(phoneSyncTimer.current);
        phoneSyncTimer.current = setTimeout(() => setPhoneSync(''), 4000);
      }
      return false;
    }
  };

  useEffect(() => {
    if (!telegramUser?.id || !phone) return;
    if (phoneSyncRef.current !== phone) {
      saveCustomer(phone, { silent: true });
    }
  }, [telegramUser?.id, phone]);

  useEffect(() => {
    if (!telegramUser?.id) return;
    fetchCustomerFromServer();
  }, [telegramUser?.id]);

  const syncTelegramContact = async (notifyUser = false) => {
    if (!telegramUser?.id) return '';
    try {
      const res = await api.post('/api/telegram/contact', { telegramId: telegramUser.id, notify: notifyUser });
      const nextPhone = res.data?.phone || '';
      if (nextPhone) {
        localStorage.setItem('tg_phone', nextPhone);
        setPhone(nextPhone);
        setPhoneVerified(false);
        localStorage.setItem('tg_phone_verified', 'false');
        const saved = await saveCustomer(nextPhone, { notify: notifyUser });
        if (saved) {
          setPhoneVerified(true);
          localStorage.setItem('tg_phone_verified', 'true');
        }
      }
      return nextPhone;
    } catch (err) {
      console.error(err);
      return '';
    }
  };

  const fetchCustomerFromServer = async () => {
    if (!telegramUser?.id) return;
    try {
      const res = await api.get('/api/customers/public', {
        params: { telegramId: telegramUser.id }
      });
      const serverPhone = res.data?.phone || '';
      if (serverPhone) {
        if (!phone || phone === serverPhone) {
          setPhone(serverPhone);
          setPhoneVerified(true);
          localStorage.setItem('tg_phone', serverPhone);
          localStorage.setItem('tg_phone_verified', 'true');
        }
      }
    } catch (err) {
      // ignore
    }
  };

  useEffect(() => {
    const tg = window.Telegram?.WebApp;
    if (!tg?.onEvent) return undefined;

    const handler = (payload) => {
      if (!isContactSuccess(payload)) {
        return;
      }
      const phoneNumber = extractPhoneNumber(payload);
      if (phoneNumber) {
        localStorage.setItem('tg_phone', phoneNumber);
        localStorage.setItem('tg_phone_verified', 'true');
        setPhone(phoneNumber);
        setPhoneVerified(true);
        saveCustomer(phoneNumber, { notify: true });
      } else {
        syncTelegramContact(true);
      }
    };

    tg.onEvent('contactRequested', handler);
    tg.onEvent?.('phoneNumberRequested', handler);
    tg.onEvent?.('web_app_request_contact', handler);
    return () => {
      tg.offEvent?.('contactRequested', handler);
      tg.offEvent?.('phoneNumberRequested', handler);
      tg.offEvent?.('web_app_request_contact', handler);
    };
  }, []);

  useEffect(() => {
    if (telegramUser) return undefined;
    let attempts = 0;
    const interval = setInterval(() => {
      const nextUser = getTelegramUser();
      if (nextUser) {
        setTelegramUser(nextUser);
        clearInterval(interval);
      }
      attempts += 1;
      if (attempts > 20) {
        clearInterval(interval);
      }
    }, 500);
    return () => clearInterval(interval);
  }, [telegramUser]);

  const requestTelegramPhone = async () => {
    if (phoneVerified && phone) {
      setPhoneSync('already');
      if (phoneSyncTimer.current) clearTimeout(phoneSyncTimer.current);
      phoneSyncTimer.current = setTimeout(() => setPhoneSync(''), 2500);
      return;
    }
    const tg = window.Telegram?.WebApp;
    if (!tg?.requestContact) {
      setError('Telegram не поддерживает запрос контакта.');
      return;
    }

    try {
      const result = await tg.requestContact();
      if (isContactSuccess(result)) {
        const phoneNumber = extractPhoneNumber(result);
        if (phoneNumber) {
          localStorage.setItem('tg_phone', phoneNumber);
          setPhone(phoneNumber);
          setPhoneVerified(false);
          localStorage.setItem('tg_phone_verified', 'false');
          const saved = await saveCustomer(phoneNumber, { notify: true });
          if (saved) {
            setPhoneVerified(true);
            localStorage.setItem('tg_phone_verified', 'true');
          }
        } else {
          syncTelegramContact(true);
        }
      }
    } catch (err) {
      console.error(err);
      setError('Не удалось получить номер телефона.');
    }
  };

  const handleClearPhone = async () => {
    const current = phone;
    localStorage.removeItem('tg_phone');
    localStorage.removeItem('tg_phone_verified');
    setPhone('');
    setPhoneVerified(false);
    setPhoneSync('cleared');
    if (phoneSyncTimer.current) clearTimeout(phoneSyncTimer.current);
    phoneSyncTimer.current = setTimeout(() => setPhoneSync(''), 2500);
    try {
      await api.post('/api/customers/clear-phone', {
        telegramId: telegramUser?.id,
        phone: current
      });
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    if (!city) {
      setPvzList([]);
      setSelectedPvz('');
      setDeliveryCost(0);
      setEtaDays(null);
      return;
    }

    const timer = setTimeout(async () => {
      setError('');
      let calcFailed = false;
      let pvzLoaded = false;
      try {
        const pvz = await api.get('/api/delivery/pvz', { params: { city, cityCode, provider: deliveryProvider } });
        const list = Array.isArray(pvz.data) ? pvz.data : [];
        setPvzList(list);
        pvzLoaded = list.length > 0;
      } catch (err) {
        console.error(err);
        setPvzList([]);
      }

      try {
        const res = await api.post('/api/delivery/calculate', {
          city,
          cityCode,
          type: 'pvz',
          provider: deliveryProvider
        });
        setDeliveryCost(res.data.cost || 0);
        setEtaDays(res.data.etaDays || null);
      } catch (err) {
        console.error(err);
        setDeliveryCost(0);
        setEtaDays(null);
        calcFailed = true;
      }

      if (calcFailed) {
        if (!pvzLoaded) {
          setError('Не удалось рассчитать доставку');
        }
      }
    }, 600);

    return () => clearTimeout(timer);
  }, [city, cityCode, deliveryProvider]);

  useEffect(() => {
    const query = city.trim();
    if (!query || query.length < 2) {
      setCitySuggestions([]);
      setCityLoading(false);
      return;
    }

    setCityLoading(true);
    const timer = setTimeout(async () => {
      try {
        const res = await api.get('/api/delivery/cities', { params: { q: query } });
        const list = Array.isArray(res.data) ? res.data : [];
        setCitySuggestions(list);
      } catch (err) {
        console.error(err);
        setCitySuggestions([]);
      } finally {
        setCityLoading(false);
      }
    }, 180);

    return () => clearTimeout(timer);
  }, [city]);

  const handleSubmit = async () => {
    if (!phone) {
      setError('Введите номер телефона или подтвердите его в Telegram');
      return;
    }
    if (!email || !city) {
      setError('Заполните email и город');
      return;
    }
    if (!enabledProviders.length) {
      setError('Доставка временно недоступна');
      return;
    }
    if (!selectedPvz) {
      setError(deliveryProvider === 'yandex' ? 'Выберите ПВЗ Яндекс' : 'Выберите ПВЗ СДЭК');
      return;
    }
    if (!paymentYookassaEnabled) {
      setError('Оплата временно недоступна');
      return;
    }
    if (items.length === 0) {
      setError('Корзина пуста');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const orderRes = await api.post('/api/orders', {
        phone,
        email,
        telegram: telegramUser ? {
          id: telegramUser.id,
          username: telegramUser.username,
          firstName: telegramUser.first_name,
          lastName: telegramUser.last_name
        } : null,
        products: items.map(i => ({ productId: i.productId, quantity: i.quantity, size: i.size })),
        delivery: {
          provider: deliveryProvider,
          type: 'pvz',
          city,
          pvz: selectedPvz,
          cost: deliveryCost
        }
      });

      const paymentRes = await api.post('/api/payments/create', {
        orderId: orderRes.data._id
      });

      if (paymentRes.data.confirmationUrl && paymentRes.data.status !== 'paid') {
        window.location.href = paymentRes.data.confirmationUrl;
        return;
      }

      if (paymentRes.data.status === 'paid') {
        clear();
        navigate(`/success?orderId=${orderRes.data._id}`);
      } else {
        setError('Оплата не прошла');
      }
    } catch (err) {
      console.error(err);
      setError('Ошибка оформления заказа');
    } finally {
      setLoading(false);
    }
  };

  const footerSpacer = paymentYookassaEnabled ? 160 : 120;

  return (
    <SiteShell headerVariant="site" headerTitle="grått" showFooter={false} showNotice>
      <div
        className="px-5"
        style={{ paddingBottom: `calc(${footerSpacer}px + env(safe-area-inset-bottom))` }}
      >
        <div className="mt-8 grid gap-10">
          {!telegramUser && (
            <div className="border border-black/10 bg-white px-4 py-3 text-[11px] uppercase tracking-[0.25em] opacity-70">
              Локальный режим: Telegram не подключен, часть функций недоступна.
            </div>
          )}
          <section>
            <p className="text-[11px] uppercase tracking-[0.3em] opacity-60">Ваш заказ</p>
            <div className="mt-4 grid gap-3">
              {items.map(item => (
                <div key={`${item.productId}-${item.size}`} className="flex items-center gap-3 border border-black/10 bg-white p-3 text-[12px] uppercase tracking-[0.25em]">
                  <div className="h-14 w-14 overflow-hidden rounded-md bg-black/5">
                    <img src={item.image} alt={item.name} className="h-full w-full object-cover" />
                  </div>
                  <div className="flex-1">
                    <div>{item.name}</div>
                    <div className="mt-1 text-[10px] opacity-60">Размер {item.size}</div>
                  </div>
                  <div>{item.quantity} × {item.price} ₽</div>
                </div>
              ))}
            </div>
          </section>

          <section>
            <p className="text-[11px] uppercase tracking-[0.3em] opacity-60">Доставка</p>
            <div className="mt-4 grid gap-3">
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <input
                  className="w-full border border-black/10 bg-white px-4 py-3 text-[12px] uppercase tracking-[0.2em]"
                  placeholder="Имя"
                  type="text"
                  value={firstName}
                  onChange={e => setFirstName(e.target.value)}
                />
                <input
                  className="w-full border border-black/10 bg-white px-4 py-3 text-[12px] uppercase tracking-[0.2em]"
                  placeholder="Фамилия"
                  type="text"
                  value={lastName}
                  onChange={e => setLastName(e.target.value)}
                />
              </div>
              <input
                className="w-full border border-black/10 bg-white px-4 py-3 text-[12px] uppercase tracking-[0.2em]"
                placeholder="Email"
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
              />
              <div className="grid gap-3">
                <input
                  className="w-full border border-black/10 bg-white px-4 py-3 text-[12px] uppercase tracking-[0.2em]"
                  placeholder="Телефон"
                  type="tel"
                  value={phone}
                  onChange={e => {
                    setPhone(e.target.value);
                    setPhoneVerified(false);
                    localStorage.setItem('tg_phone', e.target.value);
                    localStorage.setItem('tg_phone_verified', 'false');
                  }}
                />
                <p className="text-[10px] uppercase tracking-[0.25em] opacity-60">
                  {phoneVerified ? 'Телефон подтвержден в Telegram' : 'Можно подтвердить через Telegram'}
                </p>
                {phoneSync === 'saving' && (
                  <p className="text-[10px] uppercase tracking-[0.25em] text-black/60 pns-fade-in">
                    Сохраняем номер...
                  </p>
                )}
                {phoneSync === 'saved' && (
                  <p className="text-[10px] uppercase tracking-[0.25em] text-emerald-600 pns-fade-in">
                    Номер подтвержден и сохранен
                  </p>
                )}
                {phoneSync === 'already' && (
                  <p className="text-[10px] uppercase tracking-[0.25em] text-emerald-600 pns-fade-in">
                    Номер уже подтвержден
                  </p>
                )}
                {phoneSync === 'cleared' && (
                  <p className="text-[10px] uppercase tracking-[0.25em] text-black/60 pns-fade-in">
                    Номер удален
                  </p>
                )}
                {phoneSync === 'error' && (
                  <p className="text-[10px] uppercase tracking-[0.25em] text-red-600 pns-fade-in">
                    Не удалось сохранить номер
                  </p>
                )}
                {phoneVerified && phone ? (
                  <div className="grid gap-3">
                    <div className="text-[10px] uppercase tracking-[0.25em] text-emerald-600">
                      Номер подтвержден
                    </div>
                    <button
                      type="button"
                      onClick={handleClearPhone}
                      className="btn-outline px-4 py-3 text-[12px] uppercase tracking-[0.25em]"
                    >
                      Удалить номер
                    </button>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={requestTelegramPhone}
                    className="btn-outline px-4 py-3 text-[12px] uppercase tracking-[0.25em]"
                  >
                    Подтвердить телефон
                  </button>
                )}
              </div>
              <div className="grid gap-2">
                <p className="text-[10px] uppercase tracking-[0.25em] opacity-60">Способ доставки</p>
                {enabledProviders.length > 0 ? (
                  <div className="grid gap-2 sm:grid-cols-2">
                    {deliveryOptions.filter(option => option.enabled).map(option => (
                      <button
                        key={option.id}
                        type="button"
                        onClick={() => setDeliveryProvider(option.id)}
                        className={`px-4 py-3 text-[12px] uppercase tracking-[0.2em] ${deliveryProvider === option.id ? 'btn-primary' : 'btn-outline'}`}
                      >
                        {option.label}
                      </button>
                    ))}
                  </div>
                ) : (
                  <p className="text-[11px] uppercase tracking-[0.25em] text-red-500">Способы доставки отключены</p>
                )}
              </div>
              <input
                className="w-full border border-black/10 bg-white px-4 py-3 text-[12px] uppercase tracking-[0.2em]"
                placeholder="Город"
                type="text"
                value={city}
                onChange={e => {
                  setCity(e.target.value);
                  setCityCode('');
                  setPvzList([]);
                  setSelectedPvz('');
                  setPvzQuery('');
                }}
              />
              {(citySuggestions.length > 0 || cityLoading) && (
                <div className="relative">
                  <div className="absolute left-0 right-0 z-10 mt-2 max-h-56 overflow-auto border border-black/10 bg-white shadow-sm">
                    {cityLoading && (
                      <div className="px-4 py-3 text-[11px] uppercase tracking-[0.2em] opacity-60">
                        Ищем города...
                      </div>
                    )}
                    {citySuggestions.map(item => {
                      const labelParts = [item.city, item.region, item.country].filter(Boolean);
                      const label = labelParts.join(', ');
                      return (
                        <button
                          key={`${item.code}-${label}`}
                          type="button"
                          onClick={() => {
                            setCity(item.city);
                            setCityCode(item.code || '');
                            setPvzQuery('');
                            setCitySuggestions([]);
                          }}
                          className="w-full px-4 py-3 text-left text-[12px] uppercase tracking-[0.2em] hover:bg-black/5"
                        >
                          {label}
                        </button>
                      );
                    })}
                    {!cityLoading && citySuggestions.length === 0 && (
                      <div className="px-4 py-3 text-[11px] uppercase tracking-[0.2em] opacity-60">
                        Город не найден
                      </div>
                    )}
                  </div>
                </div>
              )}
              {pvzList.length > 0 && (
                <div className="grid gap-2">
                  <p className="text-[10px] uppercase tracking-[0.25em] opacity-60">
                    {deliveryProvider === 'yandex' ? 'ПВЗ Яндекс' : 'ПВЗ СДЭК'}
                  </p>
                  <div className="relative">
                    <input
                      className="w-full border border-black/10 bg-white px-4 py-3 text-[12px] uppercase tracking-[0.2em]"
                      placeholder="Введите адрес ПВЗ"
                      type="text"
                      value={pvzQuery}
                      onChange={e => {
                        setPvzQuery(e.target.value);
                        setSelectedPvz('');
                        setPvzOpen(true);
                      }}
                      onFocus={() => setPvzOpen(true)}
                      onBlur={() => setTimeout(() => setPvzOpen(false), 150)}
                    />
                    {pvzOpen && (
                      <div className="absolute left-0 right-0 z-10 mt-2 max-h-56 overflow-auto border border-black/10 bg-white shadow-sm">
                        {filteredPvzList.map(item => {
                          const label = item.address || item.location?.address || item.code || item.id;
                          return (
                            <button
                              key={item.id || item.code || item.address || item.location?.address}
                              type="button"
                              onClick={() => {
                                setSelectedPvz(label);
                                setPvzQuery(label || '');
                                setPvzOpen(false);
                              }}
                              className="w-full px-4 py-3 text-left text-[12px] uppercase tracking-[0.2em] hover:bg-black/5"
                            >
                              {label}
                            </button>
                          );
                        })}
                        {pvzQuery && filteredPvzList.length === 0 && (
                          <div className="px-4 py-3 text-[11px] uppercase tracking-[0.25em] opacity-60">
                            Совпадений не найдено
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              )}
              {!cityLoading && city && pvzList.length === 0 && (
                <p className="text-[11px] uppercase tracking-[0.25em] opacity-60">
                  ПВЗ не найдены — попробуйте выбрать город из подсказок.
                </p>
              )}
              {etaDays && (
                <p className="text-[11px] uppercase tracking-[0.25em] opacity-60">
                  Доставка {deliveryCost} ₽ · {etaDays} дн.
                </p>
              )}
            </div>
          </section>

          <section>
            <p className="text-[11px] uppercase tracking-[0.3em] opacity-60">Итог</p>
            <div className="mt-4 border border-black/10 bg-white p-5">
              <div className="flex items-center justify-between text-[12px] uppercase tracking-[0.25em]">
                <span>Товары</span>
                <span>{total} ₽</span>
              </div>
              <div className="mt-2 flex items-center justify-between text-[12px] uppercase tracking-[0.25em] opacity-70">
                <span>Доставка</span>
                <span>{deliveryCost} ₽</span>
              </div>
              <div className="mt-4 flex items-center justify-between text-[12px] uppercase tracking-[0.25em]">
                <span>Итого</span>
                <span>{total + deliveryCost} ₽</span>
              </div>
            </div>
            {!paymentYookassaEnabled && (
              <div className="mt-3 text-[11px] uppercase tracking-[0.25em] text-red-500">
                Оплата временно отключена
              </div>
            )}
          </section>
        </div>
      </div>

      <div
        className="fixed bottom-0 left-0 right-0 z-20 border-t border-black/10 bg-[--secondary] px-5 py-4"
        style={{ paddingBottom: 'calc(16px + env(safe-area-inset-bottom))' }}
      >
        <div className="mx-auto flex max-w-2xl flex-col gap-2">
          {error && <p className="text-[11px] uppercase tracking-[0.25em] text-red-500">{error}</p>}
          {paymentYookassaEnabled && (
            <button
              type="button"
              onClick={handleSubmit}
              disabled={loading || !enabledProviders.length}
              className="btn-primary flex w-full items-center justify-between rounded-md px-5 py-4 text-[12px] uppercase tracking-[0.3em]"
            >
              <span className="flex items-center gap-2">
                {paymentImageUrl && (
                  <img
                    src={paymentImageUrl.startsWith('http') ? paymentImageUrl : `${window.location.origin}${paymentImageUrl}`}
                    alt="ЮKassa"
                    className="h-5 w-auto object-contain"
                  />
                )}
                {loading ? 'Оплата...' : paymentLabel}
              </span>
              <span>{total + deliveryCost} ₽</span>
            </button>
          )}
        </div>
      </div>
    </SiteShell>
  );
};

export default Checkout;
