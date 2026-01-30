'use client';
import React from 'react';

export const ProductCard = ({ product }: { product: any }) => {
  return (
    <div className="bg-white p-4 rounded-lg shadow hover:shadow-lg transition">
      {product.image?.data?.attributes?.url && (
        <img
          src={product.image.data.attributes.url}
          alt={product.name}
          className="w-full h-48 object-cover rounded"
        />
      )}
      <h2 className="text-lg font-semibold mt-2">{product.name}</h2>
      <p className="text-gray-600 mt-1">{product.description}</p>
      <p className="text-green-600 font-bold mt-2">{product.price} ₽</p>
    </div>
  );
};
