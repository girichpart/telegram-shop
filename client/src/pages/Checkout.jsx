import React, { useState } from 'react';
import axios from 'axios';

const Checkout = () => {
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [city, setCity] = useState('');
  const [pvz, setPvz] = useState('');

  const handleSubmit = () => {
    // Вызов API для расчета доставки, создания заказа, платежа
    alert('Заказ оформлен');
  };

  return (
    <div className="pt-16 p-4">
      <h1 className="text-3xl font-bold mb-4">Оформление заказа</h1>
      <input type="tel" placeholder="Телефон" value={phone} onChange={e => setPhone(e.target.value)} className="block w-full bg-gray-900 p-2 mb-2" />
      <input type="email" placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} className="block w-full bg-gray-900 p-2 mb-2" />
      <input type="text" placeholder="Город" value={city} onChange={e => setCity(e.target.value)} className="block w-full bg-gray-900 p-2 mb-2" />
      {/* Карта ПВЗ - используйте Yandex Maps или список */}
      <button onClick={handleSubmit} className="bg-white text-black px-6 py-2 rounded">Оплатить через ЮKassa</button>
    </div>
  );
};

export default Checkout;