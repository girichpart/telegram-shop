import React, { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import api from '../api';
import SiteShell from '../components/SiteShell.jsx';

const Success = () => {
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
    <SiteShell headerVariant="site" headerTitle="grått" showFooter showNotice>
      <div className="px-5 pb-16">
        <div className="mt-8 border border-black/10 bg-white p-6">
          <p className="text-[11px] uppercase tracking-[0.3em] opacity-60">Заказ оформлен</p>
          <h1 className="heading-4 mt-3">Спасибо! Заказ оформлен.</h1>
          <p className="mt-3 text-[11px] uppercase tracking-[0.25em] opacity-60">
            Оплата может быть тестовой, если интеграции выключены.
          </p>
        </div>

        {order && (
          <div className="mt-6 border border-black/10 bg-white p-6">
            <p className="text-[12px] uppercase tracking-[0.25em]">Номер заказа</p>
            <p className="mt-2 text-[11px] uppercase tracking-[0.25em] opacity-60">{order._id}</p>
            <div className="mt-4 grid gap-2 text-[11px] uppercase tracking-[0.25em] opacity-70">
              <p>Статус: {order.status}</p>
              <p>Оплата: {order.paymentStatus}</p>
              <p>Доставка: {order.delivery?.status || 'создано'}</p>
            </div>
            <div className="mt-5 border-t border-black/10 pt-4">
              {order.products.map(item => (
                <div key={item.productId} className="flex items-center justify-between text-[11px] uppercase tracking-[0.25em]">
                  <span>{item.name} × {item.quantity}</span>
                  <span>{item.price * item.quantity} ₽</span>
                </div>
              ))}
              <div className="mt-4 flex items-center justify-between text-[12px] uppercase tracking-[0.25em]">
                <span>Итого</span>
                <span>{order.totalAmount} ₽</span>
              </div>
            </div>
          </div>
        )}

        <div className="mt-8 grid gap-3">
          <Link
            to="/"
            className="btn-primary flex items-center justify-between rounded-md px-5 py-4 text-[12px] uppercase tracking-[0.3em]"
          >
            <span>В каталог</span>
            <span>→</span>
          </Link>
          <Link
            to="/track"
            className="btn-outline flex items-center justify-between rounded-md px-5 py-4 text-[12px] uppercase tracking-[0.3em]"
          >
            <span>Отследить</span>
            <span>→</span>
          </Link>
        </div>
      </div>
    </SiteShell>
  );
};

export default Success;
