'use client';
import { useEffect, useState } from 'react';
import { getProducts } from './lib/api';
import ProductCard from './components/ProductCard';

export default function Home() {
  const [products, setProducts] = useState<any[]>([]);

  useEffect(() => {
    getProducts().then(res => setProducts(res.data || []));
  }, []);

  return (
    <>
      <h1 className="text-2xl font-bold mb-4">Каталог</h1>

      <div className="
        grid
        grid-cols-2
        gap-3
        sm:grid-cols-3
        md:grid-cols-4
      ">
        {products.map(p => (
          <ProductCard key={p.id} product={p.attributes} />
        ))}
      </div>
    </>
  );
}

