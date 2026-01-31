'use client';

import ProductList from '@/components/ProductList';
import CartButton from '@/components/CartButton';

export default function Home() {
  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Каталог товаров</h1>
      <ProductList />
      <CartButton />
    </div>
  );
}




