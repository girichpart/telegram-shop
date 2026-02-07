import React, { useCallback, useEffect, useRef, useState } from 'react';
import api from '../api';
import SiteShell from '../components/SiteShell.jsx';
import { extractPhoneNumber, getTelegramUser, isContactSuccess } from '../utils/telegram.js';

const Account = () => {
  const [telegramUser, setTelegramUser] = useState(() => getTelegramUser());
  const [phone, setPhone] = useState(() => localStorage.getItem('tg_phone') || '');
  const [phoneVerified, setPhoneVerified] = useState(() => localStorage.getItem('tg_phone_verified') === 'true');
  const [orders, setOrders] = useState([]);
  const [activeTab, setActiveTab] = useState('profile');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [phoneSync, setPhoneSync] = useState('');
  const phoneSyncRef = useRef('');
  const phoneSyncTimer = useRef(null);

  useEffect(() => () => {
    if (phoneSyncTimer.current) {
      clearTimeout(phoneSyncTimer.current);
    }
  }, []);

  const saveCustomer = async (phoneNumber, { silent = false, notify = false } = {}) => {
    if (!phoneNumber) return false;
    if (!silent) {
      setPhoneSync('saving');
    }
    try {
      await api.post('/api/customers', {
        phone: phoneNumber,
        telegram: telegramUser ? {
          id: telegramUser.id,
          username: telegramUser.username,
          firstName: telegramUser.first_name,
          lastName: telegramUser.last_name
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

  const syncTelegramContact = async (notifyUser = false) => {
    if (!telegramUser?.id) return '';
    try {
      const res = await api.post('/api/telegram/contact', { telegramId: telegramUser.id });
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

  const loadOrders = useCallback(async (payload) => {
    setLoading(true);
    setError('');
    try {
      const res = await api.get('/api/track', { params: payload });
      setOrders(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error(err);
      setError('Не удалось загрузить заказы');
    } finally {
      setLoading(false);
    }
  }, []);

  const handleRequestPhone = async () => {
    if (phoneVerified && phone) {
      setPhoneSync('already');
      if (phoneSyncTimer.current) clearTimeout(phoneSyncTimer.current);
      phoneSyncTimer.current = setTimeout(() => setPhoneSync(''), 2500);
      return;
    }
    const tg = window.Telegram?.WebApp;
    if (!tg?.requestContact) {
      setError('Telegram не поддерживает запрос контакта. Укажите номер вручную.');
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
          if (telegramUser?.id) {
            loadOrders({ telegramId: telegramUser.id });
          }
        } else {
          const synced = await syncTelegramContact(true);
          if (synced && telegramUser?.id) {
            loadOrders({ telegramId: telegramUser.id });
          }
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
    if (telegramUser?.id) {
      loadOrders({ telegramId: telegramUser.id });
    }
  }, [telegramUser?.id, loadOrders]);

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

  useEffect(() => {
    if (!telegramUser?.id || phone) return;
    syncTelegramContact();
  }, [telegramUser?.id, phone]);

  useEffect(() => {
    if (!telegramUser?.id || !phone) return;
    if (phoneSyncRef.current !== phone) {
      saveCustomer(phone, { silent: true });
    }
  }, [telegramUser?.id, phone]);

  useEffect(() => {
    if (!telegramUser?.id) return undefined;
    const interval = setInterval(() => {
      loadOrders({ telegramId: telegramUser.id });
    }, 20000);
    const handleFocus = () => loadOrders({ telegramId: telegramUser.id });
    const handleVisibility = () => {
      if (document.visibilityState === 'visible') {
        loadOrders({ telegramId: telegramUser.id });
      }
    };
    window.addEventListener('focus', handleFocus);
    document.addEventListener('visibilitychange', handleVisibility);
    return () => {
      clearInterval(interval);
      window.removeEventListener('focus', handleFocus);
      document.removeEventListener('visibilitychange', handleVisibility);
    };
  }, [telegramUser?.id, loadOrders]);

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
        if (telegramUser?.id) {
          loadOrders({ telegramId: telegramUser.id });
        }
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

  return (
    <SiteShell headerVariant="site" headerTitle="grått" showNotice>
      <div className="px-5 py-10">
        <div className="grid gap-8">
          <section>
            <p className="text-[11px] uppercase tracking-[0.3em] opacity-60">Личный кабинет</p>
            <div className="mt-4 flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => setActiveTab('profile')}
                className={`px-4 py-2 text-[11px] uppercase tracking-[0.25em] ${activeTab === 'profile' ? 'btn-primary' : 'btn-outline'}`}
              >
                Профиль
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('orders')}
                className={`px-4 py-2 text-[11px] uppercase tracking-[0.25em] ${activeTab === 'orders' ? 'btn-primary' : 'btn-outline'}`}
              >
                Заказы
              </button>
            </div>
            {activeTab === 'profile' && (
              <div className="mt-4 rounded-sm border border-black/10 bg-white p-4 text-[12px] uppercase tracking-[0.25em]">
                {telegramUser ? (
                  <div className="grid gap-2">
                    <div>Telegram: @{telegramUser.username || 'без username'}</div>
                    <div>{telegramUser.first_name} {telegramUser.last_name || ''}</div>
                    <div>Телефон: {phone || 'не подтвержден'} {phoneVerified ? '(подтвержден)' : ''}</div>
                  </div>
                ) : (
                  <div>Откройте магазин в Telegram для входа.</div>
                )}
              </div>
            )}
          </section>

          {telegramUser && activeTab === 'profile' && (
            <section>
              <p className="text-[11px] uppercase tracking-[0.3em] opacity-60">Подтверждение номера</p>
              <div className="mt-4 grid gap-3">
                <input
                  className="w-full border border-black/10 bg-white px-4 py-3 text-[12px] uppercase tracking-[0.2em] opacity-70"
                  placeholder="Телефон"
                  type="tel"
                  value={phone}
                  readOnly
                />
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
                      className="border border-black/10 bg-white px-4 py-3 text-[12px] uppercase tracking-[0.25em]"
                    >
                      Удалить номер
                    </button>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={handleRequestPhone}
                    className="border border-black/10 bg-white px-4 py-3 text-[12px] uppercase tracking-[0.25em]"
                  >
                    Подтвердить телефон
                  </button>
                )}
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
            </section>
          )}

          {telegramUser && activeTab === 'orders' && (
            <section>
              <p className="text-[11px] uppercase tracking-[0.3em] opacity-60">История</p>
              {loading && (
                <div className="mt-4 text-[11px] uppercase tracking-[0.25em] opacity-60">Загрузка...</div>
              )}
              {error && (
                <div className="mt-4 text-[11px] uppercase tracking-[0.25em] text-red-500">{error}</div>
              )}
              {!loading && orders.length === 0 && (
                <div className="mt-4 text-[11px] uppercase tracking-[0.25em] opacity-60">Заказов нет.</div>
              )}
              <div className="mt-4 grid gap-3">
                {orders.map(order => (
                  <div key={order.id} className="rounded-sm border border-black/10 bg-white p-4 text-[11px] uppercase tracking-[0.25em]">
                    <div className="flex items-center justify-between">
                      <span>Заказ #{order.id.slice(-6)}</span>
                      <span>{order.total} ₽</span>
                    </div>
                    <div className="mt-2 opacity-60">Статус: {order.status}</div>
                    <div className="mt-2 opacity-60">Оплата: {order.paymentStatus}</div>
                    <div className="mt-2 opacity-60">Доставка: {order.deliveryStatus}</div>
                    {order.trackingNumber && (
                      <div className="mt-2 opacity-60">Трек: {order.trackingNumber}</div>
                    )}
                    {order.products?.length > 0 && (
                      <div className="mt-3 grid gap-2">
                        {order.products.map((item, idx) => (
                          <div key={`${item.productId}-${idx}`} className="flex items-center justify-between text-[10px] uppercase tracking-[0.2em] opacity-70">
                            <span>{item.name}{item.size ? ` (${item.size})` : ''}</span>
                            <span>{item.quantity} × {item.price} ₽</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </section>
          )}
        </div>
      </div>
    </SiteShell>
  );
};

export default Account;
