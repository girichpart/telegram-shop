import React, { useEffect, useState } from 'react';
import { Link, useSearchParams, useNavigate } from 'react-router-dom';
import api from '../api';

const Success = () => {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const orderId = params.get('orderId');
  const [order, setOrder] = useState(null);

  useEffect(() => {
    if (!orderId) return;
    api.get(`/api/orders/${orderId}`)
      .then(res => setOrder(res.data))
      .catch(err => console.error(err));
  }, [orderId]);

  return (
    <div className="min-h-screen bg-[#f0f2f0] text-[#222222]">
      <header className="sticky top-0 z-50 bg-[#f0f2f0]/80 backdrop-blur-md px-4 py-3 flex items-center justify-between border-b border-[#d1d5db]/30">
        <div className="flex items-center gap-3" onClick={() => navigate(-1)}>
          <span className="material-symbols-outlined text-[#248bfe] cursor-pointer">arrow_back_ios</span>
          <span className="text-[#248bfe] font-medium">Back</span>
        </div>
        <h1 className="text-[17px] font-semibold">Order Complete</h1>
        <div className="w-10"></div>
      </header>

      <main className="max-w-md mx-auto w-full pt-6 pb-20 px-4">
        <h2 className="section-label">Спасибо за заказ</h2>
        <p className="text-sm text-[#8e8e93] mt-2">Оплата может быть тестовой, если интеграции выключены.</p>

        {order && (
          <div className="mt-6 bg-white border border-[#d1d5db] rounded-2xl p-4">
            <p className="text-sm font-semibold">Номер заказа: {order._id}</p>
            <p className="text-xs text-[#8e8e93] mt-1">Статус: {order.status}</p>
            <p className="text-xs text-[#8e8e93] mt-1">Оплата: {order.paymentStatus}</p>
            <p className="text-xs text-[#8e8e93] mt-1">Доставка: {order.delivery?.status || 'created'}</p>
            <div className="mt-4 space-y-2 text-sm">
              {order.products.map(item => (
                <div key={item.productId} className="flex items-center justify-between">
                  <span>{item.name} × {item.quantity}</span>
                  <span>{item.price * item.quantity} ₽</span>
                </div>
              ))}
            </div>
            <div className="mt-4 text-sm text-[#8e8e93]">Итого: {order.totalAmount} ₽</div>
          </div>
        )}

        <div className="mt-6 flex flex-col gap-3">
          <Link to="/" className="w-full bg-[#4a5d4e] text-white font-semibold py-4 rounded-2xl flex items-center justify-center">В каталог</Link>
          <Link to="/track" className="w-full border border-[#d1d5db] rounded-2xl py-4 flex items-center justify-center">Отслеживание</Link>
        </div>
      </main>
    </div>
  );
};

export default Success;
