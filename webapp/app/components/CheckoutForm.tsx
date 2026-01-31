'use client';

import { useState } from 'react';
import axios from 'axios';
import { useCartStore } from '@/stores/cartStore';
import { useRouter } from 'next/navigation';

export default function CheckoutForm() {
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('');
  const [pvz, setPvz] = useState([]);
  const [selectedPvz, setSelectedPvz] = useState('');
  const [deliveryCost, setDeliveryCost] = useState(0);
  const items = useCartStore((state) => state.items);
  const clearCart = useCartStore((state) => state.clearCart);
  const router = useRouter();

  const fetchPvz = async () => {
    try {
      const res = await axios.get(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/delivery/pvz?city=${city}`);
      setPvz(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const calculateDelivery = async () => {
    try {
      const res = await axios.post(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/delivery/calculate`, {
        fromCode: 'your_from_code', // Настрой в env
        toCode: selectedPvz.code,
        packages: [{ weight: 1000 }], // Пример, рассчитай по items
      });
      setDeliveryCost(res.data.total_sum);
    } catch (err) {
      console.error(err);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const orderData = {
        phone,
        address: selectedPvz.address,
        items: items.map(item => ({ product: item.id, quantity: item.quantity })),
        total: items.reduce((sum, item) => sum + item.attributes.price * item.quantity, 0) + deliveryCost,
        delivery: { pvz: selectedPvz, cost: deliveryCost },
      };
      const res = await axios.post(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/orders`, orderData);
      // Redirect to Yookassa
      window.location.href = res.data.payment.confirmation.confirmation_url;
      // После оплаты (webhook в backend обновит заказ), UI подтверждение в callback URL
      clearCart();
      router.push('/success'); // Создай страницу success.tsx с сообщением
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <input type="tel" placeholder="Телефон" value={phone} onChange={e => setPhone(e.target.value)} required className="border p-2 mb-2 w-full" />
      <input type="text" placeholder="Город" value={city} onChange={e => setCity(e.target.value)} required className="border p-2 mb-2 w-full" />
      <button type="button" onClick={fetchPvz} className="bg-gray-500 text-white px-4 py-2 mb-2">Найти ПВЗ</button>
      <select value={selectedPvz} onChange={e => setSelectedPvz(e.target.value)} className="border p-2 mb-2 w-full">
        <option>Выберите ПВЗ</option>
        {pvz.map((p: any) => <option key={p.code} value={p.code}>{p.address}</option>)}
      </select>
      <button type="button" onClick={calculateDelivery} className="bg-gray-500 text-white px-4 py-2 mb-2">Рассчитать доставку</button>
      <p>Стоимость доставки: {deliveryCost} руб.</p>
      <button type="submit" className="bg-green-500 text-white px-4 py-2">Оплатить через Yookassa</button>
    </form>
  );
}

