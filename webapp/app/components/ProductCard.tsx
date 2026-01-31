'use client';

import { useCart } from '../context/CartContext';

export default function ProductCard({ product }: { product: any }) {
  const { addToCart } = useCart();

  return (
    <div className="bg-white rounded-xl p-3 shadow">
      <div className="aspect-square bg-gray-100 rounded mb-2" />

      <h3 className="font-semibold text-sm">{product.title}</h3>
      <p className="text-sm text-gray-600">{product.price} ₽</p>

      <button
        onClick={() => addToCart(product)}
        className="mt-2 w-full bg-black text-white rounded-lg py-2 text-sm"
      >
        В корзину
      </button>
    </div>
  );
}

