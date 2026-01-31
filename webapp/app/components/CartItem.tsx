'use client';
import React from 'react';
import { useCart } from '../context/CartContext';

export default function CartItem({ item }: any) {
  const { removeItem } = useCart();

  return (
    <div className="flex justify-between items-center border-b py-2">
      <div>
        <p className="font-semibold">{item.title}</p>
        <p>{item.quantity} x {item.price} ₽</p>
      </div>
      <button
        onClick={() => removeItem(item.id)}
        className="bg-red-500 text-white px-2 py-1 rounded"
      >
        Удалить
      </button>
    </div>
  );
}
