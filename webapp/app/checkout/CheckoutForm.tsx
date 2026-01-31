'use client';
import React, { useState, useEffect } from 'react';

export default function CheckoutForm({ items, total }: any) {
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [pvz, setPvz] = useState('');
  const [pvzList, setPvzList] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetch('/api/getPvz')
      .then(res => res.json())
      .then(data => setPvzList(data || []));
  }, []);

  const handlePayment = async () => {
    if (!phone || !pvz) return alert('Введите телефон и выберите ПВЗ');

    setLoading(true);

    const orderRes = await fetch('http://localhost:1337/api/orders', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        data: { phone, address, pvz, items, total, status: 'Новый' }
      })
    });

    const orderData = await orderRes.json();
    const orderId = orderData.data.id;

    const paymentRes = await fetch('/api/createPayment', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ orderId, amount: total })
    });

    const paymentData = await paymentRes.json();

    if (paymentData.confirmation?.confirmation_url) {
      window.location.href = paymentData.confirmation.confirmation_url;
    } else {
      alert('Ошибка оплаты');
    }

    setLoading(false);
  };

  return (
    <div className="flex flex-col space-y-3">
      <input
        className="border p-2 rounded"
        type="text"
        placeholder="Телефон"
        value={phone}
        onChange={e => setPhone(e.target.value)}
      />
      <input
        className="border p-2 rounded"
        type="text"
        placeholder="Адрес (для курьера)"
        value={address}
        onChange={e => setAddress(e.target.value)}
      />
      <select
        className="border p-2 rounded"
        value={pvz}
        onChange={e => setPvz(e.target.value)}
      >
        <option value="">Выберите ПВЗ СДЭК</option>
        {pvzList.map(p => (
          <option key={p.Code} value={p.Code}>{p.Address}</option>
        ))}
      </select>
      <button
        className="bg-yellow-500 text-black p-2 rounded"
        onClick={handlePayment}
        disabled={loading}
      >
        {loading ? 'Создаём платёж...' : 'Оплатить и оформить'}
      </button>
    </div>
  );
}

