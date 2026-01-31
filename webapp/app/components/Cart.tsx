'use client';

import { useCartStore } from '@/stores/cartStore';
import Link from 'next/link';

export default function Cart() {
  const { items, removeItem, updateQuantity } = useCartStore();

  const total = items.reduce((sum, item) => sum + item.attributes.price * item.quantity, 0);

  return (
    <div>
      {items.length === 0 ? <p>Корзина пуста</p> : (
        <>
          {items.map((item) => (
            <div key={item.id} className="flex justify-between border-b py-2">
              <span>{item.attributes.name} x {item.quantity}</span>
              <span>{item.attributes.price * item.quantity} руб.</span>
              <button onClick={() => updateQuantity(item.id, item.quantity + 1)}>+</button>
              <button onClick={() => updateQuantity(item.id, item.quantity - 1)}>-</button>
              <button onClick={() => removeItem(item.id)}>Удалить</button>
            </div>
          ))}
          <p className="text-xl mt-4">Итого: {total} руб.</p>
          <Link href="/checkout" className="bg-blue-500 text-white px-4 py-2 mt-2 inline-block">Оформить</Link>
        </>
      )}
    </div>
  );
}