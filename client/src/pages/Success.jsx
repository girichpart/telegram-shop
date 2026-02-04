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
        <h2 className="section-label">Заказ оформлен</h2>
        <p className="text-sm mt-2" style={{ color: 'var(--tma-muted)' }}>Оплата может быть тестовой, если интеграции выключены.</p>

        {order && (
          <div className="mt-6 bg-white border rounded-2xl p-5" style={{ borderColor: 'var(--tma-border)' }}>
            <p className="text-sm font-semibold">Номер заказа: {order._id}</p>
            <p className="text-xs mt-1" style={{ color: 'var(--tma-muted)' }}>Статус: {order.status}</p>
            <p className="text-xs mt-1" style={{ color: 'var(--tma-muted)' }}>Оплата: {order.paymentStatus}</p>
            <p className="text-xs mt-1" style={{ color: 'var(--tma-muted)' }}>Доставка: {order.delivery?.status || 'created'}</p>
            <div className="mt-4 space-y-2 text-sm">
              {order.products.map(item => (
                <div key={item.productId} className="flex items-center justify-between">
                  <span>{item.name} × {item.quantity}</span>
                  <span>{item.price * item.quantity} ₽</span>
                </div>
              ))}
            </div>
            <div className="mt-4 text-sm" style={{ color: 'var(--tma-muted)' }}>Итого: {order.totalAmount} ₽</div>
          </div>
        )}

        <div className="mt-8 flex flex-col gap-4">
          <Link to="/" className="w-full text-white font-semibold py-4 rounded-2xl flex items-center justify-center" style={{ background: 'var(--tma-button)' }}>В каталог</Link>
          <Link to="/track" className="w-full border rounded-2xl py-4 flex items-center justify-center" style={{ borderColor: 'var(--tma-border)' }}>Отслеживание</Link>
        </div>
      </main>
    </div>
  );
};

export default Success;
