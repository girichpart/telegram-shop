import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext.jsx';
import SiteShell from '../components/SiteShell.jsx';

const Cart = () => {
  const navigate = useNavigate();
  const { items, updateQuantity, removeItem, total } = useCart();

  return (
    <SiteShell headerVariant="back" headerTitle="Корзина" showFooter={false} onBack={() => navigate(-1)}>
      <div className="px-5 pb-32">
        <div className="mt-8 flex items-center justify-between">
          <p className="text-[11px] uppercase tracking-[0.3em] opacity-60">Ваша корзина</p>
          <p className="text-[11px] uppercase tracking-[0.3em] opacity-60">{items.length} шт</p>
        </div>

        <div className="mt-8 grid gap-5">
          {items.length === 0 && (
            <div className="border border-black/10 bg-white px-5 py-8 text-[11px] uppercase tracking-[0.3em] opacity-60">
              Корзина пуста
            </div>
          )}

          {items.map(item => (
            <div key={`${item.productId}-${item.size || 'ONE'}`} className="flex items-center gap-4 border border-black/10 bg-white p-4">
              <div className="h-24 w-20 overflow-hidden rounded-md bg-black/5">
                <img src={item.image} alt={item.name} className="h-full w-full object-cover" />
              </div>
              <div className="flex-1">
                <p className="text-[12px] uppercase tracking-[0.25em]">{item.name}</p>
                <p className="mt-2 text-[11px] uppercase tracking-[0.25em] opacity-60">Размер {item.size || 'ONE'}</p>
                <div className="mt-4 flex items-center justify-between">
                  <p className="text-[12px] uppercase tracking-[0.25em]">{item.price} ₽</p>
                  <div className="flex items-center gap-2 border border-black/10 px-2 py-1">
                    <button
                      type="button"
                      onClick={() => updateQuantity(item.productId, item.size, item.quantity - 1)}
                      className="px-2 text-[12px]"
                    >
                      -
                    </button>
                    <span className="text-[11px] uppercase tracking-[0.25em]">{item.quantity}</span>
                    <button
                      type="button"
                      onClick={() => updateQuantity(item.productId, item.size, item.quantity + 1)}
                      className="px-2 text-[12px]"
                    >
                      +
                    </button>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => removeItem(item.productId, item.size)}
                  className="mt-3 text-[10px] uppercase tracking-[0.25em] opacity-50"
                >
                  Удалить
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="fixed bottom-0 left-0 right-0 z-20 border-t border-black/10 bg-[--secondary] px-5 py-4">
        <div className="mx-auto flex max-w-2xl flex-col gap-3">
          <div className="flex items-center justify-between text-[12px] uppercase tracking-[0.25em] opacity-70">
            <span>Подытог</span>
            <span>{total} ₽</span>
          </div>
          <div className="flex items-center justify-between text-[12px] uppercase tracking-[0.25em] opacity-70">
            <span>Доставка</span>
            <span>Рассчитаем</span>
          </div>
          <div className="flex items-center justify-between text-[13px] uppercase tracking-[0.25em]">
            <span>Итого</span>
            <span>{total} ₽</span>
          </div>
          {items.length > 0 && (
            <Link
              to="/checkout"
              className="btn-primary mt-2 flex w-full items-center justify-between rounded-md px-5 py-4 text-[12px] uppercase tracking-[0.3em]"
            >
              <span>Оформить заказ</span>
              <span>→</span>
            </Link>
          )}
        </div>
      </div>
    </SiteShell>
  );
};

export default Cart;
