import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext.jsx';

const Cart = () => {
  const navigate = useNavigate();
  const { items, updateQuantity, removeItem, total } = useCart();

  return (
    <div className="min-h-screen relative overflow-hidden" style={{ background: 'var(--tma-bg)', color: 'var(--tma-text)' }}>
      <div className="absolute inset-0 bg-cover bg-center opacity-20" style={{ backgroundImage: "url('https://lh3.googleusercontent.com/aida-public/AB6AXuB2q1OvjP12VnloCiFBJidGa-1aFVpTzdkU0aAQeFZ0UH0Vg9niHoPRuZrT_tto9ZfXySVnjoQW3itiyO4Mfl9vAV5GJU0_yNN3EfI94DDosidC548erN7GtDt3PvdZ4l7FXfxsq1geV5SxLnJWauZt_ecH8ZpppfW7Yw54IOTwj8rsimzjtKi8IF8ZDO098zZnw3vmAE7mj7Cm69au-IRE-yRtKJh-BIBtTWni-AqmeuIKNfT7nYk8qf0Fda-ulr1Kz4GldZV9YBo')" }}></div>
      <div className="relative z-10 max-w-md mx-auto w-full min-h-screen flex flex-col shadow-2xl" style={{ background: 'var(--tma-surface)' }}>
        <div className="flex items-center justify-between px-6 pt-9 pb-5">
          <div>
            <h1 className="text-xl font-semibold text-stone-800">Your Cart</h1>
            <p className="text-xs text-stone-500 mt-0.5">{items.length} items selected</p>
          </div>
          <button className="w-8 h-8 flex items-center justify-center rounded-full bg-stone-200/50 text-stone-600" onClick={() => navigate(-1)}>
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>

        <div className="px-6 pb-6">
          <div className="bg-white rounded-xl p-3 border border-stone-100 shadow-sm">
            <div className="flex justify-between items-center mb-2">
              <span className="text-[11px] font-medium uppercase tracking-wider" style={{ color: 'var(--tma-button)' }}>Free Shipping</span>
              <span className="text-[11px] text-stone-500">{Math.max(0, 15000 - total)} ₽ left</span>
            </div>
            <div className="w-full bg-stone-100 h-1.5 rounded-full overflow-hidden">
              <div className="h-full rounded-full" style={{ width: `${Math.min(100, (total / 15000) * 100)}%`, background: 'var(--tma-button)' }}></div>
            </div>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto px-6 space-y-4 pb-10 hide-scrollbar">
          {items.length === 0 && (
            <div className="text-sm text-stone-500">Корзина пуста</div>
          )}

          {items.map(item => (
            <div key={item.productId} className="flex items-center gap-4 bg-white p-4 rounded-2xl border border-stone-100">
              <div className="size-16 rounded-xl bg-stone-100 bg-cover bg-center shrink-0" style={{ backgroundImage: `url(${item.image})` }}></div>
              <div className="flex-1 min-w-0">
                <h3 className="text-sm font-semibold text-stone-800 truncate">{item.name}</h3>
                <p className="text-[11px] text-stone-500">Size: {item.size || 'M'}</p>
                <div className="flex items-center justify-between mt-2">
                  <span className="text-sm font-bold" style={{ color: 'var(--tma-button)' }}>{item.price} ₽</span>
                  <div className="flex items-center gap-3 bg-stone-50 rounded-lg px-2 py-1 border border-stone-100">
                    <button className="text-stone-400 text-lg font-medium leading-none px-1" onClick={() => updateQuantity(item.productId, item.quantity - 1)}>-</button>
                    <span className="text-xs font-bold text-stone-700">{item.quantity}</span>
                    <button className="text-lg font-medium leading-none px-1" style={{ color: 'var(--tma-button)' }} onClick={() => updateQuantity(item.productId, item.quantity + 1)}>+</button>
                  </div>
                </div>
                <button onClick={() => removeItem(item.productId)} className="mt-2 text-xs text-red-500">Удалить</button>
              </div>
            </div>
          ))}
        </div>

        <div className="p-6 bg-white border-t border-stone-100 space-y-4">
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-stone-400 text-sm">Subtotal</span>
              <span className="text-stone-800 font-medium">{total} ₽</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-stone-400 text-sm">Shipping</span>
              <span className="text-stone-600 text-sm">Calculated at next step</span>
            </div>
            <div className="flex justify-between items-center pt-2 mt-2 border-t border-stone-50">
              <span className="text-stone-800 font-bold">Total</span>
              <span className="text-xl font-bold text-stone-900">{total} ₽</span>
            </div>
          </div>
          {items.length > 0 && (
            <Link to="/checkout" className="w-full active:scale-[0.98] transition-all py-4 px-6 rounded-xl flex items-center justify-center gap-2 group" style={{ background: 'var(--tma-accent)' }}>
              <span className="text-white font-semibold text-[17px]">Proceed to Checkout</span>
              <span className="material-symbols-outlined text-white text-[20px]">arrow_forward</span>
            </Link>
          )}
          <div className="h-4"></div>
        </div>
      </div>
    </div>
  );
};

export default Cart;
