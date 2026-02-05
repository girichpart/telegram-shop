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
      if (existing) {
        return prev.map(p =>
          itemKey(p) === itemKey(item)
            ? { ...p, quantity: p.quantity + qty }
            : p
        );
      }
      return [...prev, { ...item, quantity: qty }];
    });
  };

  const updateQuantity = (productId, size, qty) => {
    setItems(prev => {
      if (qty <= 0) return prev.filter(p => !(p.productId === productId && (p.size || 'ONE') === (size || 'ONE')));
      return prev.map(p =>
        p.productId === productId && (p.size || 'ONE') === (size || 'ONE')
          ? { ...p, quantity: qty }
          : p
      );
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
