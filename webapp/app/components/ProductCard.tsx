import React from 'react';

interface ProductCardProps {
  product: any;
  addToCart: (product: any) => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product, addToCart }) => {
  return (
    <div style={{ border: '1px solid #ccc', padding: 12, margin: 12 }}>
      <h3>{product.attributes.title}</h3>
      <p>{product.attributes.description}</p>
      <p>Price: {product.attributes.price} ₽</p>
      <button onClick={() => addToCart(product)}>Add to Cart</button>
    </div>
  );
};
