'use client';
import { useEffect, useState } from 'react';

export default function AccountPage() {
  const [orders, setOrders] = useState<any[]>([]);

  useEffect(() => {
    const phone = prompt('Введите ваш номер телефона для проверки заказов:');
    if (!phone) return;
    fetch(`http://localhost:1337/api/orders?filters[phone][$eq]=${phone}`)
      .then(res => res.json())
      .then(data => setOrders(data.data || []));
  }, []);

  return (
    <div className="p-4 max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Ваши заказы</h1>
      {orders.length === 0 ? (
        <p>Заказы не найдены</p>
      ) : (
        <ul>
          {orders.map(order => (
            <li key={order.id} className="mb-2 border p-2 rounded">
              <p>Номер заказа: {order.id}</p>
              <p>Статус: {order.attributes.status}</p>
              <p>Сумма: {order.attributes.total} ₽</p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
