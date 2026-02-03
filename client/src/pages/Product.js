import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';

const Product = () => {
  const { id } = useParams();
  const [product, setProduct] = useState(null);

  useEffect(() => {
    axios.get(`http://localhost:3000/api/products/${id}`)
      .then(res => setProduct(res.data))
      .catch(err => console.error(err));
  }, [id]);

  const addToCart = () => {
    // Логика добавления в корзину (localStorage или API)
    alert('Добавлено в корзину');
  };

  if (!product) return <div>Загрузка...</div>;

  return (
    <div className="pt-16 p-4">
      <img src={product.images[0]} alt={product.name} className="w-full h-64 object-cover mb-4" />
      <h1 className="text-2xl font-bold mb-2">{product.name}</h1>
      <p className="text-xl mb-4">{product.price} ₽</p>
      <p className="mb-4">{product.description}</p>
      <button onClick={addToCart} className="bg-white text-black px-6 py-2 rounded">Добавить в корзину</button>
    </div>
  );
};

export default Product;