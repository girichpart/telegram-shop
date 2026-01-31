'use client';
import { useEffect, useState } from 'react';
import { getProducts, createProduct, deleteProduct } from '../lib/api';


export default function AdminShop() {
  const [products, setProducts] = useState<any[]>([]);
  const [title, setTitle] = useState('');
  const [price, setPrice] = useState<number>(0);

  const fetchProducts = () => {
    getProducts().then(data => {
      setProducts(data.data.map((p: any) => ({ id: p.id, ...p.attributes })));
    });
  };

  useEffect(() => { fetchProducts(); }, []);

  const addProduct = async () => {
    await createProduct({ title, price });
    setTitle(''); setPrice(0);
    fetchProducts();
  };

  const removeProduct = async (id: number) => {
    await deleteProduct(id);
    fetchProducts();
  };

  return (
    <div className="p-4 max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Админка</h1>
      <div className="mb-4">
        <input value={title} onChange={e => setTitle(e.target.value)} placeholder="Название" className="border p-2 mr-2"/>
        <input value={price} onChange={e => setPrice(Number(e.target.value))} type="number" placeholder="Цена" className="border p-2 mr-2"/>
        <button onClick={addProduct} className="bg-black text-white p-2 rounded">Добавить</button>
      </div>
      <ul>
        {products.map(p => (
          <li key={p.id} className="flex justify-between mb-2">
            {p.title} - {p.price} ₽
            <button onClick={() => removeProduct(p.id)} className="text-red-500">Удалить</button>
          </li>
        ))}
      </ul>
    </div>
  );
}
