import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api';
import SiteShell from '../components/SiteShell.jsx';

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
    <SiteShell headerVariant="back" headerTitle="Tracking" showFooter onBack={() => navigate(-1)}>
      <div className="px-5 pb-16">
        <div className="mt-8 border border-black/10 bg-white p-5">
          <p className="text-[11px] uppercase tracking-[0.3em] opacity-60">Track by phone</p>
          <div className="mt-4 grid gap-3">
            <input
              type="tel"
              placeholder="Phone number"
              value={phone}
              onChange={e => setPhone(e.target.value)}
              className="w-full border border-black/10 bg-white px-4 py-3 text-[12px] uppercase tracking-[0.2em]"
            />
            <button
              type="button"
              onClick={handleTrack}
              className="border border-black/10 bg-black px-4 py-3 text-[12px] uppercase tracking-[0.25em] text-white"
            >
              Check status
            </button>
            {error && <p className="text-[11px] uppercase tracking-[0.25em] text-red-500">{error}</p>}
          </div>
        </div>

        <div className="mt-8 grid gap-4">
          {orders.map(order => (
            <div key={order.id} className="border border-black/10 bg-white p-5">
              <p className="text-[12px] uppercase tracking-[0.25em]">Order #{order.id}</p>
              <div className="mt-3 grid gap-2 text-[11px] uppercase tracking-[0.25em] opacity-70">
                <p>Status: {order.status}</p>
                <p>Payment: {order.paymentStatus}</p>
                <p>Delivery: {order.deliveryStatus}</p>
                {order.trackingNumber && <p>Tracking: {order.trackingNumber}</p>}
                <p>Total: {order.total} ₽</p>
              </div>
            </div>
          ))}
          {hasSearched && orders.length === 0 && !error && (
            <p className="text-[11px] uppercase tracking-[0.25em] opacity-60">
              Пока нет заказов для этого номера.
            </p>
          )}
        </div>
      </div>
    </SiteShell>
  );
};

export default Track;
