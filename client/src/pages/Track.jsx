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
    <div className="min-h-screen bg-[#f0f2f0] text-[#222222]">
      <header className="sticky top-0 z-50 bg-[#f0f2f0]/80 backdrop-blur-md px-4 py-3 flex items-center justify-between border-b border-[#d1d5db]/30">
        <div className="flex items-center gap-3" onClick={() => navigate(-1)}>
          <span className="material-symbols-outlined text-[#248bfe] cursor-pointer">arrow_back_ios</span>
          <span className="text-[#248bfe] font-medium">Back</span>
        </div>
        <h1 className="text-[17px] font-semibold">Tracking</h1>
        <div className="w-10"></div>
      </header>

      <main className="max-w-md mx-auto w-full pt-6 pb-20 px-4">
        <h2 className="section-label">Track by phone</h2>
        <div className="mt-4 flex flex-col gap-3">
          <input type="tel" placeholder="Номер телефона" value={phone} onChange={e => setPhone(e.target.value)} className="tma-input" />
          <button onClick={handleTrack} className="w-full border border-[#d1d5db] rounded-xl py-3 text-sm font-medium">Проверить</button>
        </div>
        {error && <p className="mt-3 text-xs text-red-500">{error}</p>}

        <div className="mt-6 space-y-3">
          {orders.map(order => (
            <div key={order.id} className="bg-white border border-[#d1d5db] rounded-2xl p-4">
              <p className="text-sm font-semibold">Заказ #{order.id}</p>
              <p className="text-xs text-[#8e8e93] mt-1">Статус: {order.status}</p>
              <p className="text-xs text-[#8e8e93] mt-1">Оплата: {order.paymentStatus}</p>
              <p className="text-xs text-[#8e8e93] mt-1">Доставка: {order.deliveryStatus}</p>
              {order.trackingNumber && (
                <p className="text-xs text-[#8e8e93] mt-1">Трек: {order.trackingNumber}</p>
              )}
              <p className="text-xs text-[#8e8e93] mt-1">Сумма: {order.total} ₽</p>
            </div>
          ))}
          {hasSearched && orders.length === 0 && !error && (
            <p className="text-[#8e8e93] text-sm">Пока нет заказов для этого номера.</p>
          )}
        </div>
      </main>
    </div>
  );
};

export default Track;
