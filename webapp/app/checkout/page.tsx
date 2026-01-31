'use client';

import { useCart } from '../context/CartContext';

export default function CheckoutPage() {
  const { items, total, removeFromCart } = useCart();

  return (
    <div className="p-4 max-w-md mx-auto">
      <h1 className="text-xl font-bold mb-4">Корзина</h1>

      {items.length === 0 && (
        <p className="text-gray-500">Корзина пуста</p>
      )}

      <div className="space-y-3">
        {items.map(item => (
          <div
            key={item.id}
            className="bg-white rounded-lg p-3 flex justify-between items-center"
          >
            <div>
              <p className="font-medium text-sm">{item.title}</p>
              <p className="text-xs text-gray-500">
                {item.quantity} × {item.price} ₽
              </p>
            </div>

            <button
              onClick={() => removeFromCart(item.id)}
              className="text-red-500 text-sm"
            >
              ✕
            </button>
          </div>
        ))}
      </div>

      {items.length > 0 && (
        <div className="mt-6">
          <div className="flex justify-between mb-3 font-semibold">
            <span>Итого</span>
            <span>{total} ₽</span>
          </div>

          <button className="w-full bg-green-600 text-white py-3 rounded-xl">
            Оплатить
          </button>
        </div>
      )}
    </div>
  );
}
