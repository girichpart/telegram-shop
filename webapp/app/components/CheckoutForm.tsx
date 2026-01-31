'use client';

import { useCart } from '../context/CartContext';

export default function CheckoutForm() {
  const { total } = useCart();

  // Поля заказа только для СДЭК + ЮKassa
  const [form, setForm] = useState({
    deliveryPoint: '', // ПВЗ СДЭК
    paymentMethod: 'yookassa', // ЮKassa
  });

  const update = (key: string, value: string) => {
    setForm(prev => ({ ...prev, [key]: value }));
  };

  const submitOrder = () => {
    console.log('ORDER DATA:', form);
    alert('Заказ оформлен (заглушка)');
  };

  return (
    <div className="bg-white rounded-xl p-4 space-y-4">
      <h2 className="font-semibold text-lg">Оформление заказа</h2>

      {/* Выбор ПВЗ */}
      <input
        placeholder="Выберите пункт выдачи СДЭК"
        className="w-full border rounded-lg p-2"
        value={form.deliveryPoint}
        onChange={e => update('deliveryPoint', e.target.value)}
      />

      {/* Оплата */}
      <select
        className="w-full border rounded-lg p-2"
        value={form.paymentMethod}
        onChange={e => update('paymentMethod', e.target.value)}
      >
        <option value="yookassa">Оплата ЮKassa</option>
        <option value="cash">Наличные при получении</option>
      </select>

      {/* Итог */}
      <div className="flex justify-between font-semibold text-lg pt-2">
        <span>Итого</span>
        <span>{total} ₽</span>
      </div>

      <button
        onClick={submitOrder}
        className="w-full bg-black text-white py-3 rounded-xl"
      >
        Оформить заказ
      </button>
    </div>
  );
}

