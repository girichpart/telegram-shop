'use client';

import { useState } from 'react';
import axios from 'axios';

export default function OrderTracker() {
  const [phone, setPhone] = useState('');
  const [orders, setOrders] = useState([]);

  const handleTrack = async () => {
    try {
      const res = await axios.get(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/orders?phone=${phone}`);
      setOrders(res.data.data);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div>
      <input type="tel" placeholder="Телефон" value={phone} onChange={e => setPhone(e.target.value)} className="border p-2 mb-2 w-full" />
      <button onClick={handleTrack} className="bg-blue-500 text-white px-4 py-2">Отслеживать</button>
      {orders.map((order: any) => (
        <div key={order.id} className="border p-4 mt-4">
          <p>Заказ #{order.id}</p>
          <p>Статус: {order.attributes.status}</p>
          <p>Трекинг CDEK: {order.attributes.delivery.tracking}</p>
        </div>
      ))}
    </div>
  );
}