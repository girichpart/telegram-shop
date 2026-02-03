import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';

const Product = () => {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios.get(`http://localhost:3000/api/products/${id}`)
      .then(res => {
        setProduct(res.data);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  }, [id]);

  const addToCart = () => {
    alert('Добавлено в корзину! (логика корзины позже)');
    // TODO: localStorage.setItem('cart', JSON.stringify(...))
  };

  if (loading) return <div className="pt-16 p-4">Загрузка...</div>;
  if (!product) return <div className="pt-16 p-4">Товар не найден</div>;

  return (
    <div className="pt-16 p-4">
      <Link to="/" className="text-sm mb-4 inline-block hover:underline">← Назад</Link>
      <img src={product.images?.[0] || 'https://via.placeholder.com/300'} alt={product.name} className="w-full h-64 object-cover mb-4 rounded" />
      <h1 className="text-2xl font-bold mb-2">{product.name}</h1>
      <p className="text-xl mb-4">{product.price} ₽</p>
      <p className="mb-4 text-gray-300">{product.description || 'Описание товара'}</p>
      <button onClick={addToCart} className="bg-white text-black px-6 py-3 rounded font-bold w-full">Добавить в корзину</button>
    </div>
  );
};

export default Product;