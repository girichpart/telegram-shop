import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';

const Home = () => {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState(['Top', 'Bottom', 'Jewelry', 'Accessories', 'Headwear']);

  useEffect(() => {
    axios.get('http://localhost:3000/api/products')
      .then(res => setProducts(res.data))
      .catch(err => console.error(err));
  }, []);

  return (
    <div className="pt-16 p-4">
      <h1 className="text-3xl font-bold mb-4">Каталог</h1>
      <div className="flex space-x-4 mb-6 overflow-x-auto">
        {categories.map(cat => (
          <button key={cat} className="border border-white px-4 py-2 rounded">{cat}</button>
        ))}
      </div>
      <div className="grid grid-cols-2 gap-4">
        {products.map(product => (
          <Link key={product._id} to={`/product/${product._id}`} className="bg-gray-900 p-4 rounded">
            <img src={product.images[0]} alt={product.name} className="w-full h-48 object-cover mb-2" />
            <h2 className="font-bold">{product.name}</h2>
            <p>{product.price} ₽</p>
            <p className="text-sm">{product.stock > 0 ? 'В наличии' : 'Нет в наличии'}</p>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default Home;