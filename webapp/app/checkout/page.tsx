'use client';
import React from 'react';
import { useCart } from '../context/CartContext';
import CheckoutForm from '../components/CheckoutForm';
import CartSummary from '../components/CartSummary';

export default function CheckoutPage() {
  const { items, total } = useCart();

  return (
    <div className="p-4 max-w-2xl mx-auto space-y-4">
      <h1 className="text-2xl font-bold">Оформление заказа</h1>
      <CartSummary />
      {items.length > 0 && <CheckoutForm items={items} total={total} />}
    </div>
  );
}






