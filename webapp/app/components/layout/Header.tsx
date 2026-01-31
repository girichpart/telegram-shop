'use client';
import { useState } from 'react';
import { useCart } from '../../store/cart';
import CartDrawer from '../cart/CartDrawer';

export default function Header() {
  const [open, setOpen] = useState(false);
  const items = useCart(state => state.items);

  return (
    <>
      <header className="sticky top-0 bg-white border-b z-40">
        <div className="h-14 px-4 flex justify-between items-center max-w-6xl mx-auto">
          <span className="font-bold">🛍 Mini Shop</span>

          <button onClick={() => setOpen(true)}>
            🛒 {items.length}
          </button>
        </div>
      </header>

      <CartDrawer open={open} onClose={() => setOpen(false)} />
    </>
  );
}
