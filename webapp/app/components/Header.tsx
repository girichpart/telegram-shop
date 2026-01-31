'use client';
import Link from 'next/link';
import CartIcon from './CartIcon';

export default function Header() {
  return (
    <header className="flex justify-between items-center p-4 bg-white shadow sticky top-0 z-50">
      <h1 className="font-bold text-xl">Mini App Shop</h1>
      <div className="flex items-center space-x-4">
        <Link href="/admin-shop" className="text-sm text-blue-600 hover:underline">
          Админка
        </Link>
        <Link href="/account" className="text-sm text-blue-600 hover:underline">
          Личный кабинет
        </Link>
        <CartIcon />
      </div>
    </header>
  );
}
