'use client';
import React, { useState, useEffect } from 'react';
import { createOrder } from '../lib/api';

export default function Checkout() {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [cart, setCart] = useState<any[]>([]);

  useEffect(() => {
    const savedCart = localStorage.getItem('cart');
    if (savedCart) setCart(JSON.parse(savedCart));
  }, []);

  const handleSubmit = async () => {
    if (!name || !phone) {
      alert('Please fill in all fields');
      return;
    }

    const orderData = {
      customerName: name,
      phone,
      products: cart.map((p) => ({ id: p.id, quantity: 1 })), // можно добавить количество позже
      total: cart.reduce((sum, item) => sum + item.attributes.price, 0),
    };

    const order = await createOrder(orderData);
    alert('Order created! ID: ' + order.data.id);

    // Очистить корзину после оформления
    localStorage.removeItem('cart');
    setCart([]);
    setName('');
    setPhone('');
  };

  return (
    <div style={{ padding: 20 }}>
      <h1>Checkout</h1>
      {cart.length === 0 ? (
        <p>Your cart is empty</p>
      ) : (
        <div>
          <ul>
            {cart.map((item, i) => (
              <li key={i}>
                {item.attributes.title} - {item.attributes.price} ₽
              </li>
            ))}
          </ul>
          <p>Total: {cart.reduce((sum, item) => sum + item.attributes.price, 0)} ₽</p>
          <input
            placeholder="Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
          <input
            placeholder="Phone"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
          />
          <button onClick={handleSubmit}>Submit Order</button>
        </div>
      )}
    </div>
  );
}
