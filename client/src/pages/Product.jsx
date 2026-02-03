import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import api from '../api';
import { useCart } from '../context/CartContext.jsx';

const sizes = ['S', 'M', 'L', 'XL'];

const Product = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addItem } = useCart();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedSize, setSelectedSize] = useState('M');

  useEffect(() => {
    api.get(`/api/products/${id}`)
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
    if (!product) return;
    addItem({
      productId: product._id,
      name: product.name,
      price: product.price,
      image: product.images?.[0] || 'https://via.placeholder.com/300',
      size: selectedSize
    }, 1);
  };

  if (loading) return <div className="px-4 py-10 text-sm">Загрузка...</div>;
  if (!product) return <div className="px-4 py-10 text-sm">Товар не найден</div>;

  return (
    <div className="min-h-screen bg-[#f5f5f4] text-[#2d2a26] font-['Inter']">
      <div className="max-w-md mx-auto relative flex flex-col pb-32">
        <header className="sticky top-0 z-50 flex items-center bg-[#f5f5f4]/90 backdrop-blur-md px-4 py-3 justify-between">
          <button className="flex items-center text-[#0088cc] font-medium gap-1" onClick={() => navigate(-1)}>
            <span className="material-symbols-outlined text-2xl">chevron_left</span>
            <span className="text-lg">Back</span>
          </button>
          <h2 className="text-sm font-semibold tracking-tight text-[#2d2a26]/40 uppercase">Product Detail</h2>
          <div className="w-16 flex justify-end">
            <button className="text-[#0088cc]">
              <span className="material-symbols-outlined">share</span>
            </button>
          </div>
        </header>

        <div className="relative w-full aspect-square px-4 mb-4">
          <div className="w-full h-full rounded-3xl overflow-hidden bg-white shadow-sm ring-1 ring-black/5">
            <img alt={product.name} className="w-full h-full object-cover" src={product.images?.[0] || 'https://via.placeholder.com/600'} />
          </div>
        </div>

        <div className="px-6">
          <div className="mb-6">
            <p className="text-[11px] font-bold text-[#78716c] uppercase tracking-wider mb-1">{product.category || 'Urban Excursion / FW24'}</p>
            <h1 className="text-3xl font-bold tracking-tight text-[#2d2a26] uppercase">{product.name}</h1>
            <p className="text-xl font-medium text-[#57534e] mt-1">{product.price} ₽</p>
          </div>

          <div className="mb-8">
            <p className="text-[11px] font-bold text-[#2d2a26]/40 uppercase tracking-widest mb-3">Select Size</p>
            <div className="flex gap-2">
              {sizes.map(size => (
                <button
                  key={size}
                  onClick={() => setSelectedSize(size)}
                  className={
                    selectedSize === size
                      ? 'flex-1 py-3 rounded-xl border-2 border-[#0088cc] bg-[#0088cc]/5 font-bold text-sm text-[#0088cc]'
                      : 'flex-1 py-3 rounded-xl border border-[#2d2a26]/10 bg-white font-medium text-sm active:bg-stone-200 transition-colors'
                  }
                >
                  {size}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-6">
            <section>
              <h3 className="text-[11px] font-bold text-[#2d2a26]/40 uppercase tracking-widest mb-4 border-b border-[#2d2a26]/5 pb-2">Technical Specifications</h3>
              <div className="grid grid-cols-1 gap-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="material-symbols-outlined text-[#78716c]">water_drop</span>
                    <span className="text-sm font-medium">Water Resistance</span>
                  </div>
                  <span className="text-sm font-semibold">28,000 mm</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="material-symbols-outlined text-[#78716c]">air</span>
                    <span className="text-sm font-medium">Breathability</span>
                  </div>
                  <span className="text-sm font-semibold">20,000 g/m²</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="material-symbols-outlined text-[#78716c]">fitness_center</span>
                    <span className="text-sm font-medium">Product Weight</span>
                  </div>
                  <span className="text-sm font-semibold">{product.weight || '412 grams'}</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="material-symbols-outlined text-[#78716c]">shield</span>
                    <span className="text-sm font-medium">Fabric Technology</span>
                  </div>
                  <span className="text-sm font-semibold">{product.fabric || 'Gore-Tex Pro 3L'}</span>
                </div>
              </div>
            </section>
            <section>
              <h3 className="text-[11px] font-bold text-[#2d2a26]/40 uppercase tracking-widest mb-3">Description</h3>
              <p className="text-sm leading-relaxed text-[#57534e]">
                {product.description || 'Designed for high-intensity movement in volatile urban environments. The X-1 Alpha features an articulated silhouette for unrestricted mobility and a modular storm hood system.'}
              </p>
            </section>
          </div>
        </div>

        <div className="fixed bottom-0 left-0 right-0 p-4 bg-[#f5f5f4]/80 backdrop-blur-lg border-t border-[#2d2a26]/5 max-w-md mx-auto z-50">
          <button onClick={addToCart} className="w-full bg-[#0088cc] text-white h-[50px] rounded-xl font-bold text-base flex items-center justify-center gap-2 active:opacity-90 transition-opacity">
            <span>Add to Cart</span>
            <span className="opacity-40 font-normal">|</span>
            <span>{product.price} ₽</span>
          </button>
          <div className="mt-3 text-xs text-center text-[#8e8e93]">
            <Link to="/cart" className="text-[#0088cc]">Перейти в корзину</Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Product;
