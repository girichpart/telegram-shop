'use client';

import { useState, useEffect } from 'react';
import axios from 'axios';
import { useCartStore } from '@/stores/cartStore';

interface Product {
  id: number;
  attributes: {
    name: string;
    price: number;
    description: string;
    sizes: string[];
    colors: string[];
    quantity: number;
    image: { data: { attributes: { url: string } } };
  };
}

export default function ProductList() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const addToCart = useCartStore((state) => state.addItem);

  useEffect(() => {
    axios.get(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/products`)
      .then((res) => {
        setProducts(res.data.data);
        setLoading(false);
      })
      .catch((err) => console.error(err));
  }, []);

  if (loading) return <p>Загрузка...</p>;

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {products.map((product) => (
        <div key={product.id} className="border p-4">
          <img src={`${process.env.NEXT_PUBLIC_BACKEND_URL}${product.attributes.image.data.attributes.url}`} alt={product.attributes.name} className="w-full h-48 object-cover" />
          <h2 className="text-xl">{product.attributes.name}</h2>
          <p>{product.attributes.description}</p>
          <p>Цена: {product.attributes.price} руб.</p>
          <p>Размеры: {product.attributes.sizes.join(', ')}</p>
          <p>Цвета: {product.attributes.colors.join(', ')}</p>
          <p>В наличии: {product.attributes.quantity}</p>
          <button onClick={() => addToCart(product)} className="bg-blue-500 text-white px-4 py-2 mt-2">Добавить в корзину</button>
        </div>
      ))}
    </div>
  );
}