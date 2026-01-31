'use client';

import Cart from '@/components/Cart';

export default function CartPage() {
  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Корзина</h1>
      <Cart />
    </div>
  );
}