'use client';
import React from 'react';
import { useCart } from '../context/CartContext';
import CartItem from './CartItem';

export default function CartSummary() {
  const { items, total } = useCart();

  if (items.length === 0) return <p>Корзина пуста</p>;

  return (
    <div className="p-4 border rounded space-y-2">
      {items.map((item: any) => <CartItem key={item.id} item={item} />)}
      <p className="font-bold mt-2">Итого: {total} ₽</p>
    </div>
  );
}
