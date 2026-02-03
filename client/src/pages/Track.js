import React, { useState } from 'react';
import axios from 'axios';

const Track = () => {
  const [phone, setPhone] = useState('');
  const [orders, setOrders] = useState([]);

  const handleTrack = () => {
    axios.get(`http://localhost:3000/api/track?phone=${phone}`)
      .then(res => setOrders(res.data))
      .catch(err => console.error(err));
  };

  return (
    <div className="pt-16 p-4">
      <h1 className="text-3xl font-bold mb-4">Отслеживание заказа</h1>
      <input type="tel" placeholder="Номер телефона" value={phone} onChange={e => setPhone(e.target.value)} className="block w-full bg-gray-900 p-2 mb-2" />
      <button onClick={handleTrack} className="bg-white text-black px-6 py-2 rounded mb-4">Проверить</button>
      {orders.map(order => (
        <div key={order.id} className="bg-gray-900 p-4 mb-2 rounded">
          <p>Заказ #{order.id}</p>
          <p>Статус: {order.status}</p>
        </div>
      ))}
    </div>
  );
};

export default Track;