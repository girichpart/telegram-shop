import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api';
import { useCart } from '../context/CartContext.jsx';
import SiteShell from '../components/SiteShell.jsx';
import { extractPhoneNumber, isContactSuccess } from '../utils/telegram.js';

const Checkout = () => {
  const navigate = useNavigate();
  const { items, total, clear } = useCart();

  const telegramUser = window.Telegram?.WebApp?.initDataUnsafe?.user || null;
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
  const [email, setEmail] = useState(draft.email || '');
  const [firstName, setFirstName] = useState(draft.firstName || '');
  const [lastName, setLastName] = useState(draft.lastName || '');
  const [city, setCity] = useState(draft.city || '');
  const [deliveryProvider, setDeliveryProvider] = useState(draft.deliveryProvider || 'cdek');
  const [pvzList, setPvzList] = useState([]);
  const [selectedPvz, setSelectedPvz] = useState(draft.selectedPvz || '');
  const [deliveryCost, setDeliveryCost] = useState(0);
  const [etaDays, setEtaDays] = useState(null);
  const [settings, setSettings] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const deliveryOptions = useMemo(() => ([
    { id: 'cdek', label: 'СДЭК ПВЗ', enabled: settings?.deliveryCdekEnabled !== false },
    { id: 'yandex', label: 'Яндекс доставка', enabled: settings?.deliveryYandexEnabled === true }
  ]), [settings]);
  const enabledProviders = deliveryOptions.filter(option => option.enabled).map(option => option.id);
  const paymentYookassaEnabled = settings?.paymentYookassaEnabled !== false;

  useEffect(() => {
    const timer = setTimeout(() => {
      const payload = {
        phone,
        email,
        firstName,
        lastName,
        city,
        selectedPvz,
        deliveryProvider
      };
      localStorage.setItem('checkout_draft_v1', JSON.stringify(payload));
    }, 300);
    return () => clearTimeout(timer);
  }, [phone, email, firstName, lastName, city, selectedPvz, deliveryProvider]);

  useEffect(() => {
    setPvzList([]);
    setSelectedPvz('');
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

  const saveCustomer = async (phoneNumber) => {
    if (!telegramUser?.id || !phoneNumber) return;
    try {
      await api.post('/api/customers', {
        phone: phoneNumber,
        telegram: {
          id: telegramUser.id,
          username: telegramUser.username,
          firstName: telegramUser.first_name,
          lastName: telegramUser.last_name
        }
      });
    } catch (err) {
      console.error(err);
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
        saveCustomer(phoneNumber);
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

  const requestTelegramPhone = async () => {
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
          localStorage.setItem('tg_phone_verified', 'true');
          setPhone(phoneNumber);
          setPhoneVerified(true);
          saveCustomer(phoneNumber);
        }
      }
    } catch (err) {
      console.error(err);
      setError('Не удалось получить номер телефона.');
    }
  };

  const botUsername = import.meta.env.VITE_TELEGRAM_BOT_USERNAME;
  const handleOpenBot = () => {
    if (!botUsername) {
      setError('Укажите VITE_TELEGRAM_BOT_USERNAME в .env');
      return;
    }
    const url = `https://t.me/${botUsername}`;
    const tg = window.Telegram?.WebApp;
    if (tg?.openTelegramLink) {
      tg.openTelegramLink(url);
    } else {
      window.open(url, '_blank');
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
      try {
        const res = await api.post('/api/delivery/calculate', {
          city,
          type: 'pvz',
          provider: deliveryProvider
        });
        setDeliveryCost(res.data.cost || 0);
        setEtaDays(res.data.etaDays || null);

        const pvz = await api.get('/api/delivery/pvz', { params: { city, provider: deliveryProvider } });
        setPvzList(Array.isArray(pvz.data) ? pvz.data : []);
      } catch (err) {
        console.error(err);
        setError('Не удалось рассчитать доставку');
      }
    }, 600);

    return () => clearTimeout(timer);
  }, [city, deliveryProvider]);

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

  return (
    <SiteShell headerVariant="site" headerTitle="grått" showFooter={false} showNotice>
      <div className="px-5 pb-32">
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
                <button
                  type="button"
                  onClick={requestTelegramPhone}
                  className="btn-outline px-4 py-3 text-[12px] uppercase tracking-[0.25em]"
                >
                  Подтвердить номер через Telegram
                </button>
                <button
                  type="button"
                  onClick={handleOpenBot}
                  className="btn-outline px-4 py-3 text-[12px] uppercase tracking-[0.25em]"
                >
                  Открыть бота
                </button>
                <p className="text-[10px] uppercase tracking-[0.25em] opacity-60">
                  Нажмите /start в боте, чтобы получать уведомления.
                </p>
              </div>
              <input
                className="w-full border border-black/10 bg-white px-4 py-3 text-[12px] uppercase tracking-[0.2em]"
                placeholder="Город"
                type="text"
                value={city}
                onChange={e => setCity(e.target.value)}
              />
              {pvzList.length > 0 && (
                <div className="grid gap-2">
                  <p className="text-[10px] uppercase tracking-[0.25em] opacity-60">
                    {deliveryProvider === 'yandex' ? 'ПВЗ Яндекс' : 'ПВЗ СДЭК'}
                  </p>
                  <select
                    className="w-full border border-black/10 bg-white px-4 py-3 text-[12px] uppercase tracking-[0.2em]"
                    value={selectedPvz}
                    onChange={e => setSelectedPvz(e.target.value)}
                  >
                    <option value="">Выберите ПВЗ</option>
                    {pvzList.map(item => (
                      <option key={item.id || item.code || item.address || item.location?.address} value={item.address || item.location?.address || item.code || item.id}>
                        {item.address || item.location?.address || item.code || item.id}
                      </option>
                    ))}
                  </select>
                </div>
              )}
              {etaDays && (
                <p className="text-[11px] uppercase tracking-[0.25em] opacity-60">
                  Доставка {deliveryCost} ₽ · {etaDays} дн.
                </p>
              )}
            </div>
          </section>

          {paymentYookassaEnabled ? (
            <section>
              <p className="text-[11px] uppercase tracking-[0.3em] opacity-60">Оплата</p>
              <div className="mt-4 border border-black/10 bg-white p-5">
                <div className="flex items-center justify-between text-[12px] uppercase tracking-[0.25em]">
                  <span>ЮKassa</span>
                  <span>{total + deliveryCost} ₽</span>
                </div>
              </div>
            </section>
          ) : (
            <section>
              <p className="text-[11px] uppercase tracking-[0.3em] opacity-60">Оплата</p>
              <div className="mt-4 border border-black/10 bg-white p-5">
                <div className="text-[11px] uppercase tracking-[0.25em] text-red-500">Оплата временно отключена</div>
              </div>
            </section>
          )}
        </div>
      </div>

      <div className="fixed bottom-0 left-0 right-0 z-20 border-t border-black/10 bg-[--secondary] px-5 py-4">
        <div className="mx-auto flex max-w-2xl flex-col gap-2">
          {error && <p className="text-[11px] uppercase tracking-[0.25em] text-red-500">{error}</p>}
          {paymentYookassaEnabled && (
            <button
              type="button"
              onClick={handleSubmit}
              disabled={loading || !enabledProviders.length}
              className="btn-primary flex w-full items-center justify-between rounded-md px-5 py-4 text-[12px] uppercase tracking-[0.3em]"
            >
              <span>{loading ? 'Оплата...' : 'Оплатить через ЮKassa'}</span>
              <span>{total + deliveryCost} ₽</span>
            </button>
          )}
        </div>
      </div>
    </SiteShell>
  );
};

export default Checkout;
