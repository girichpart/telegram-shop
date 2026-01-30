'use client';
import React, { useEffect, useState } from 'react';
import { getProducts } from './lib/api';
import { ProductCard } from './components/ProductCard';

export default function Home() {
  const [products, setProducts] = useState<any[]>([]);

  useEffect(() => {
    getProducts().then(data => setProducts(data.data || []));
  }, []);

  return (
    <div className="p-4 max-w-6xl mx-auto">
      <h1 className="text-4xl font-bold mb-6">Mini App Shop</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
        {products.map((p: any) => (
          <ProductCard key={p.id} product={p.attributes} />
        ))}
      </div>
    </div>
  );
}
