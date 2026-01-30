import React from 'react';

interface CartProps {
  cart: any[];
  removeFromCart: (index: number) => void;
}

export const Cart: React.FC<CartProps> = ({ cart, removeFromCart }) => {
  const total = cart.reduce((sum, item) => sum + item.attributes.price, 0);

  return (
    <div style={{ border: '1px solid #000', padding: 12, margin: 12 }}>
      <h3>Cart</h3>
      {cart.map((item, i) => (
        <div key={i}>
          {item.attributes.title} - {item.attributes.price} ₽
          <button onClick={() => removeFromCart(i)}>Remove</button>
        </div>
      ))}
      <p>Total: {total} ₽</p>
    </div>
  );
};
