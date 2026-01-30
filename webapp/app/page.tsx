'use client';
import React, { useState, useEffect } from 'react';
import { ProductCard } from './components/ProductCard';
import { Cart } from './components/Cart';
import { getProducts } from './lib/api';
import { useRouter } from 'next/navigation';

export default function Home() {
  const [products, setProducts] = useState<any[]>([]);
  const [cart, setCart] = useState<any[]>([]);
  const router = useRouter();

  useEffect(() => {
    getProducts().then((data) => setProducts(data.data || []));
  }, []);

  const addToCart = (product: any) => setCart([...cart, product]);
  const removeFromCart = (index: number) => setCart(cart.filter((_, i) => i !== index));

  const goToCheckout = () => {
    // Сохраняем корзину в localStorage
    localStorage.setItem('cart', JSON.stringify(cart));
    router.push('/checkout');
  };

  return (
    <div>
      <h1>Telegram Mini App Shop</h1>
      <Cart cart={cart} removeFromCart={removeFromCart} />
      <button onClick={goToCheckout} disabled={cart.length === 0}>
        Proceed to Checkout
      </button>
      <div style={{ display: 'flex', flexWrap: 'wrap' }}>
        {products.map((p) => (
          <ProductCard key={p.id} product={p} addToCart={addToCart} />
        ))}
      </div>
    </div>
  );
}

