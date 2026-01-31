'use client';

export default function Header() {
  return (
    <header className="sticky top-0 z-50 bg-white border-b">
      <div className="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between">
        <span className="font-bold text-lg">🛍 Mini Shop</span>
        <button className="text-sm font-medium">Корзина</button>
      </div>
    </header>
  );
}
