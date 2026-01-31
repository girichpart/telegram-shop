'use client';

import { useEffect, useState } from 'react';
import ProductCard from './components/ProductCard';
import { getProducts } from './lib/api';
import Header from './components/Header';

export default function Home() {
  const [products, setProducts] = useState<any[]>([]);

  useEffect(() => {
    // Получаем товары из Strapi
    getProducts().then(data => {
      // Преобразуем API-ответ Strapi в удобный формат
      const items = data.data.map((p: any) => ({
        id: p.id,
        ...p.attributes
      }));
      setProducts(items);
    });
  }, []);

  return (
    <>
      {/* Шапка с ссылками на админку, личный кабинет и корзину */}
      <Header />

      {/* Основной контент */}
      <div className="p-4 max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold mb-4">Каталог</h1>

        {products.length === 0 ? (
          <p>Нет товаров</p>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {products.map(product => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </div>
    </>
  );
}





