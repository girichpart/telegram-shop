'use client';

import Link from 'next/link';
import { useCartStore } from '@/stores/cartStore';

export default function CartButton() {
  const itemCount = useCartStore((state) => state.items.length);

  return (
    <Link href="/cart" className="fixed bottom-4 right-4 bg-green-500 text-white px-4 py-2 rounded-full">
      Корзина ({itemCount})
    </Link>
  );
}