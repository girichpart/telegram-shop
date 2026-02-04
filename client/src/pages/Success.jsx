import React, { useEffect, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import api from '../api';
import SiteShell from '../components/SiteShell.jsx';

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
    <SiteShell headerVariant="back" headerTitle="Success" showFooter onBack={() => navigate(-1)}>
      <div className="px-5 pb-16">
        <div className="mt-8 border border-black/10 bg-white p-6">
          <p className="text-[11px] uppercase tracking-[0.3em] opacity-60">Order confirmed</p>
          <h1 className="heading-4 mt-3">Спасибо! Заказ оформлен.</h1>
          <p className="mt-3 text-[11px] uppercase tracking-[0.25em] opacity-60">
            Оплата может быть тестовой, если интеграции выключены.
          </p>
        </div>

        {order && (
          <div className="mt-6 border border-black/10 bg-white p-6">
            <p className="text-[12px] uppercase tracking-[0.25em]">Order ID</p>
            <p className="mt-2 text-[11px] uppercase tracking-[0.25em] opacity-60">{order._id}</p>
            <div className="mt-4 grid gap-2 text-[11px] uppercase tracking-[0.25em] opacity-70">
              <p>Status: {order.status}</p>
              <p>Payment: {order.paymentStatus}</p>
              <p>Delivery: {order.delivery?.status || 'created'}</p>
            </div>
            <div className="mt-5 border-t border-black/10 pt-4">
              {order.products.map(item => (
                <div key={item.productId} className="flex items-center justify-between text-[11px] uppercase tracking-[0.25em]">
                  <span>{item.name} × {item.quantity}</span>
                  <span>{item.price * item.quantity} ₽</span>
                </div>
              ))}
              <div className="mt-4 flex items-center justify-between text-[12px] uppercase tracking-[0.25em]">
                <span>Total</span>
                <span>{order.totalAmount} ₽</span>
              </div>
            </div>
          </div>
        )}

        <div className="mt-8 grid gap-3">
          <Link
            to="/"
            className="flex items-center justify-between rounded-md bg-black px-5 py-4 text-[12px] uppercase tracking-[0.3em] text-white"
          >
            <span>Back to shop</span>
            <span>→</span>
          </Link>
          <Link
            to="/track"
            className="flex items-center justify-between border border-black/10 bg-white px-5 py-4 text-[12px] uppercase tracking-[0.3em]"
          >
            <span>Track order</span>
            <span>→</span>
          </Link>
        </div>
      </div>
    </SiteShell>
  );
};

export default Success;
