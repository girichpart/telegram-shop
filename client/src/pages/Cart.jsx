import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext.jsx';

const Cart = () => {
  const navigate = useNavigate();
  const { items, updateQuantity, removeItem, total } = useCart();

  return (
    <div className="min-h-screen bg-[#f0f2f0] text-[#222222]">
      <header className="sticky top-0 z-50 bg-[#f0f2f0]/80 backdrop-blur-md px-4 py-3 flex items-center justify-between border-b border-[#d1d5db]/30">
        <div className="flex items-center gap-3" onClick={() => navigate(-1)}>
          <span className="material-symbols-outlined text-[#248bfe] cursor-pointer">arrow_back_ios</span>
          <span className="text-[#248bfe] font-medium">Back</span>
        </div>
        <h1 className="text-[17px] font-semibold">Cart</h1>
        <div className="w-10"></div>
      </header>

      <main className="max-w-md mx-auto w-full pt-6 pb-32">
        {items.length === 0 ? (
          <div className="px-4">
            <p className="text-[#8e8e93]">Корзина пуста</p>
            <Link to="/" className="mt-6 inline-block text-[#248bfe]">Вернуться в каталог</Link>
          </div>
        ) : (
          <div className="px-4 space-y-4">
            {items.map(item => (
              <div key={item.productId} className="bg-white border border-[#d1d5db] rounded-2xl p-4 flex gap-3">
                <div className="h-20 w-20 rounded-xl overflow-hidden bg-gray-100">
                  <img src={item.image} alt={item.name} className="h-full w-full object-cover" />
                </div>
                <div className="flex-1">
                  <h3 className="text-sm font-semibold uppercase tracking-tight">{item.name}</h3>
                  <p className="text-xs text-[#8e8e93] mt-1">{item.price} ₽</p>
                  <div className="mt-3 flex items-center gap-2">
                    <button onClick={() => updateQuantity(item.productId, item.quantity - 1)} className="h-8 w-8 border border-[#d1d5db] rounded-lg">-</button>
                    <span className="text-sm">{item.quantity}</span>
                    <button onClick={() => updateQuantity(item.productId, item.quantity + 1)} className="h-8 w-8 border border-[#d1d5db] rounded-lg">+</button>
                    <button onClick={() => removeItem(item.productId)} className="ml-auto text-xs text-red-500">Удалить</button>
                  </div>
                </div>
              </div>
            ))}

            <div className="bg-white border border-[#d1d5db] rounded-2xl p-4">
              <div className="flex justify-between text-sm">
                <span className="text-[#8e8e93]">Subtotal</span>
                <span>{total} ₽</span>
              </div>
              <div className="flex justify-between text-sm mt-2">
                <span className="text-[#8e8e93]">Shipping</span>
                <span>—</span>
              </div>
              <div className="flex justify-between text-base font-semibold mt-4 pt-3 border-t border-[#d1d5db]/40">
                <span>Total</span>
                <span className="text-[#4a5d4e]">{total} ₽</span>
              </div>
            </div>
          </div>
        )}
      </main>

      {items.length > 0 && (
        <div className="fixed bottom-0 left-0 right-0 p-4 bg-[#f0f2f0]/95 backdrop-blur-xl border-t border-[#d1d5db]/50">
          <div className="max-w-md mx-auto w-full">
            <Link to="/checkout" className="w-full bg-[#4a5d4e] text-white font-semibold py-4 rounded-2xl flex items-center justify-center gap-2 shadow-lg shadow-[#4a5d4e]/20">
              Checkout {total} ₽
            </Link>
          </div>
        </div>
      )}
    </div>
  );
};

export default Cart;
