'use client';
import { useCart } from '../context/CartContext';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function CartIcon() {
  const { items } = useCart();
  const [open, setOpen] = useState(false);
  const totalItems = items.reduce((sum, i) => sum + i.quantity, 0);
  const router = useRouter();

  return (
    <div className="fixed top-4 right-4 z-50">
      <button
        onClick={() => router.push('/checkout')}
        className="relative bg-black text-white p-3 rounded-full"
      >
        🛒
        {totalItems > 0 && (
          <span className="absolute -top-2 -right-2 bg-red-500 rounded-full w-5 h-5 text-xs flex items-center justify-center">
            {totalItems}
          </span>
        )}
      </button>
    </div>
  );
}

