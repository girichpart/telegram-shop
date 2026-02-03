import React from 'react';
import { Link } from 'react-router-dom';

const Cart = () => {
  // Здесь логика корзины (state или API)
  const cartItems = []; // Пример

  return (
    <div className="pt-16 p-4">
      <h1 className="text-3xl font-bold mb-4">Корзина</h1>
      {cartItems.length === 0 ? (
        <p>Корзина пуста</p>
      ) : (
        <div>
          {/* Список товаров */}
          <Link to="/checkout" className="block bg-white text-black px-6 py-2 rounded mt-4">Оформить</Link>
        </div>
      )}
    </div>
  );
};

export default Cart;