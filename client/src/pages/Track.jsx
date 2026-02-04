import React, { useState } from 'react';
import api from '../api';
import { useNavigate } from 'react-router-dom';

const Track = () => {
  const navigate = useNavigate();
  const [phone, setPhone] = useState('');
  const [orders, setOrders] = useState([]);
  const [error, setError] = useState('');
  const [hasSearched, setHasSearched] = useState(false);

  const handleTrack = () => {
    if (!phone) {
      setError('Укажите номер телефона');
      return;
    }

    setError('');
    setHasSearched(true);

    api.get(`/api/track?phone=${encodeURIComponent(phone)}`)
      .then(res => setOrders(res.data))
      .catch(err => {
        console.error(err);
        setError('Не удалось найти заказы');
      });
  };

  return (
    <div className="min-h-screen" style={{ background: 'var(--tma-bg)', color: 'var(--tma-text)' }}>
      <header className="sticky top-0 z-50 backdrop-blur-md px-4 py-3 flex items-center justify-between border-b" style={{ background: 'var(--tma-bg)', borderColor: 'var(--tma-border)' }}>
        <div className="flex items-center gap-3" onClick={() => navigate(-1)}>
          <span className="material-symbols-outlined cursor-pointer" style={{ color: 'var(--tma-link)' }}>chevron_left</span>
          <span className="font-medium" style={{ color: 'var(--tma-link)' }}>Back</span>
        </div>
        <h1 className="text-lg font-medium tracking-tight lowercase">grått</h1>
        <div className="w-10"></div>
      </header>

      <main className="max-w-md mx-auto w-full pt-8 pb-20 px-5">
        <h2 className="section-label">Track by phone</h2>
        <div className="mt-5 flex flex-col gap-4">
          <input type="tel" placeholder="Номер телефона" value={phone} onChange={e => setPhone(e.target.value)} className="tma-input" />
          <button onClick={handleTrack} className="w-full border rounded-xl py-3 text-sm font-medium" style={{ borderColor: 'var(--tma-border)' }}>Проверить</button>
        </div>
        {error && <p className="mt-3 text-xs text-red-500">{error}</p>}

        <div className="mt-8 space-y-4">
          {orders.map(order => (
            <div key={order.id} className="bg-white border rounded-2xl p-5" style={{ borderColor: 'var(--tma-border)' }}>
              <p className="text-sm font-semibold">Заказ #{order.id}</p>
              <p className="text-xs mt-1" style={{ color: 'var(--tma-muted)' }}>Статус: {order.status}</p>
              <p className="text-xs mt-1" style={{ color: 'var(--tma-muted)' }}>Оплата: {order.paymentStatus}</p>
              <p className="text-xs mt-1" style={{ color: 'var(--tma-muted)' }}>Доставка: {order.deliveryStatus}</p>
              {order.trackingNumber && (
                <p className="text-xs mt-1" style={{ color: 'var(--tma-muted)' }}>Трек: {order.trackingNumber}</p>
              )}
              <p className="text-xs mt-1" style={{ color: 'var(--tma-muted)' }}>Сумма: {order.total} ₽</p>
            </div>
          ))}
          {hasSearched && orders.length === 0 && !error && (
            <p className="text-sm" style={{ color: 'var(--tma-muted)' }}>Пока нет заказов для этого номера.</p>
          )}
        </div>
      </main>
    </div>
  );
};

export default Track;
