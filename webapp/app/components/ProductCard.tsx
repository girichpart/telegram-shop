'use client';
import React from 'react';

export const ProductCard = ({ product }: { product: any }) => {
  const imageUrl =
    product?.image?.data?.attributes?.url
      ? `http://localhost:1337${product.image.data.attributes.url}`
      : null;

  return (
    <div className="bg-white p-4 rounded-lg shadow hover:shadow-lg transition">
      {imageUrl ? (
        <img
          src={imageUrl}
          alt={product?.name || 'Product'}
          className="w-full h-48 object-cover rounded"
        />
      ) : (
        <div className="w-full h-48 bg-gray-200 flex items-center justify-center rounded text-gray-500">
          Нет изображения
        </div>
      )}

      <h2 className="text-lg font-semibold mt-2">
        {product?.name || 'Без названия'}
      </h2>

      <p className="text-gray-600 mt-1">
        {product?.description || ''}
      </p>

      <p className="text-green-600 font-bold mt-2">
        {product?.price ? `${product.price} ₽` : ''}
      </p>
    </div>
  );
};
