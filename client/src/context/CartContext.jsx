import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';

const CartContext = createContext(null);
const STORAGE_KEY = 'cart_v1';

const readStorage = () => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
};

export const CartProvider = ({ children }) => {
  const [items, setItems] = useState([]);

  useEffect(() => {
    setItems(readStorage());
  }, []);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  }, [items]);

  const itemKey = (item) => `${item.productId}::${item.size || 'ONE'}`;

  const addItem = (item, qty = 1) => {
    setItems(prev => {
      const existing = prev.find(p => itemKey(p) === itemKey(item));
      const maxStock = Number.isFinite(item.maxStock)
        ? item.maxStock
        : Number.isFinite(existing?.maxStock)
          ? existing.maxStock
          : null;
      if (existing) {
        const nextQty = maxStock !== null ? Math.min(existing.quantity + qty, maxStock) : existing.quantity + qty;
        return prev.map(p =>
          itemKey(p) === itemKey(item)
            ? { ...p, ...item, quantity: nextQty }
            : p
        );
      }
      const initialQty = maxStock !== null ? Math.min(qty, maxStock) : qty;
      if (maxStock !== null && maxStock <= 0) {
        return prev;
      }
      return [...prev, { ...item, quantity: initialQty }];
    });
  };

  const updateQuantity = (productId, size, qty) => {
    setItems(prev => {
      const normalizedSize = size || 'ONE';
      if (qty <= 0) return prev.filter(p => !(p.productId === productId && (p.size || 'ONE') === normalizedSize));
      return prev.map(p => {
        if (p.productId !== productId || (p.size || 'ONE') !== normalizedSize) return p;
        const maxStock = Number.isFinite(p.maxStock) ? p.maxStock : null;
        const nextQty = maxStock !== null ? Math.min(qty, maxStock) : qty;
        return { ...p, quantity: nextQty };
      });
    });
  };

  const removeItem = (productId, size) => {
    setItems(prev => prev.filter(p => !(p.productId === productId && (p.size || 'ONE') === (size || 'ONE'))));
  };

  const clear = () => setItems([]);

  const count = useMemo(() => items.reduce((sum, i) => sum + i.quantity, 0), [items]);
  const total = useMemo(() => items.reduce((sum, i) => sum + i.quantity * i.price, 0), [items]);

  const value = {
    items,
    addItem,
    updateQuantity,
    removeItem,
    clear,
    count,
    total
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};

export const useCart = () => {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be used within CartProvider');
  return ctx;
};
