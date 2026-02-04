import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext.jsx';
import SiteShell from '../components/SiteShell.jsx';

const Cart = () => {
  const navigate = useNavigate();
  const { items, updateQuantity, removeItem, total } = useCart();

  return (
    <SiteShell headerVariant="back" headerTitle="Cart" showFooter={false} onBack={() => navigate(-1)}>
      <div className="px-5 pb-32">
        <div className="mt-8 flex items-center justify-between">
          <p className="text-[11px] uppercase tracking-[0.3em] opacity-60">Your cart</p>
          <p className="text-[11px] uppercase tracking-[0.3em] opacity-60">{items.length} items</p>
        </div>

        <div className="mt-8 grid gap-5">
          {items.length === 0 && (
            <div className="border border-black/10 bg-white px-5 py-8 text-[11px] uppercase tracking-[0.3em] opacity-60">
              Cart is empty
            </div>
          )}

          {items.map(item => (
            <div key={item.productId} className="flex items-center gap-4 border border-black/10 bg-white p-4">
              <div className="h-24 w-20 overflow-hidden rounded-md bg-black/5">
                <img src={item.image} alt={item.name} className="h-full w-full object-cover" />
              </div>
              <div className="flex-1">
                <p className="text-[12px] uppercase tracking-[0.25em]">{item.name}</p>
                <p className="mt-2 text-[11px] uppercase tracking-[0.25em] opacity-60">Size {item.size || 'M'}</p>
                <div className="mt-4 flex items-center justify-between">
                  <p className="text-[12px] uppercase tracking-[0.25em]">{item.price} ₽</p>
                  <div className="flex items-center gap-2 border border-black/10 px-2 py-1">
                    <button
                      type="button"
                      onClick={() => updateQuantity(item.productId, item.quantity - 1)}
                      className="px-2 text-[12px]"
                    >
                      -
                    </button>
                    <span className="text-[11px] uppercase tracking-[0.25em]">{item.quantity}</span>
                    <button
                      type="button"
                      onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                      className="px-2 text-[12px]"
                    >
                      +
                    </button>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => removeItem(item.productId)}
                  className="mt-3 text-[10px] uppercase tracking-[0.25em] opacity-50"
                >
                  Remove
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="fixed bottom-0 left-0 right-0 z-20 border-t border-black/10 bg-[--secondary] px-5 py-4">
        <div className="mx-auto flex max-w-2xl flex-col gap-3">
          <div className="flex items-center justify-between text-[12px] uppercase tracking-[0.25em] opacity-70">
            <span>Subtotal</span>
            <span>{total} ₽</span>
          </div>
          <div className="flex items-center justify-between text-[12px] uppercase tracking-[0.25em] opacity-70">
            <span>Shipping</span>
            <span>Calculated</span>
          </div>
          <div className="flex items-center justify-between text-[13px] uppercase tracking-[0.25em]">
            <span>Total</span>
            <span>{total} ₽</span>
          </div>
          {items.length > 0 && (
            <Link
              to="/checkout"
              className="mt-2 flex w-full items-center justify-between rounded-md bg-black px-5 py-4 text-[12px] uppercase tracking-[0.3em] text-white"
            >
              <span>Proceed to Checkout</span>
              <span>→</span>
            </Link>
          )}
        </div>
      </div>
    </SiteShell>
  );
};

export default Cart;
