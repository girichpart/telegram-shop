import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';

const Home = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios.get('http://localhost:3000/api/products')
      .then(res => {
        setProducts(res.data);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  }, []);

  if (loading) return <div className="pt-16 p-4">Загрузка...</div>;

  return (
    <div className="pt-16 p-4">
      <h1 className="text-3xl font-bold mb-6">Каталог</h1>
      <div className="flex space-x-4 mb-6 overflow-x-auto pb-2">
        {['Top', 'Bottom', 'Jewelry', 'Accessories', 'Headwear'].map(cat => (
          <button key={cat} className="border border-white px-4 py-2 rounded whitespace-nowrap">{cat}</button>
        ))}
      </div>
      {products.length === 0 ? (
        <p>Товаров пока нет. Добавьте в админке.</p>
      ) : (
        <div className="grid grid-cols-2 gap-4">
          {products.map(product => (
            <Link key={product._id} to={`/product/${product._id}`} className="bg-gray-900 p-3 rounded hover:bg-gray-800">
              <img src={product.images?.[0] || 'https://via.placeholder.com/150'} alt={product.name} className="w-full h-48 object-cover mb-2 rounded" />
              <h2 className="font-bold text-sm">{product.name}</h2>
              <p className="text-lg">{product.price} ₽</p>
              <p className="text-xs text-green-400">{product.stock > 0 ? 'В наличии' : 'Нет в наличии'}</p>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
};

export default Home;