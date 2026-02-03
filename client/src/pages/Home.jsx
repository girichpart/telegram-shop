import React, { useEffect, useState } from 'react';
import api from '../api';
import { Link } from 'react-router-dom';

const Home = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/api/products')
      .then(res => {
        setProducts(res.data);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  }, []);

  const hero = products[0];
  const list = products.slice(1);

  return (
    <div className="min-h-screen bg-[#1a1c1a] text-[#e0e0e0] font-['Space_Grotesk']">
      <header className="sticky top-0 z-50 border-b border-white/5" style={{ background: 'rgba(26, 28, 26, 0.85)', backdropFilter: 'blur(8px)' }}>
        <div className="flex items-center justify-between h-14 px-4">
          <span className="text-sm font-bold tracking-tight uppercase">Elements Shop</span>
          <div className="flex items-center gap-4">
            <button className="flex items-center justify-center" aria-label="Search">
              <span className="material-symbols-outlined text-[22px]">search</span>
            </button>
            <Link to="/cart" className="flex items-center justify-center relative" aria-label="Cart">
              <span className="material-symbols-outlined text-[22px]">shopping_bag</span>
            </Link>
          </div>
        </div>
      </header>

      <main className="flex flex-col w-full pb-24">
        {loading && (
          <div className="p-6 text-sm text-white/60">Загрузка...</div>
        )}

        {!loading && hero && (
          <section className="mb-12">
            <Link to={`/product/${hero._id}`} className="block">
              <div className="relative w-full aspect-[4/5] bg-[#e5e7eb] overflow-hidden">
                <div
                  className="absolute inset-0 bg-cover bg-center"
                  style={{ backgroundImage: `url(${hero.images?.[0] || 'https://via.placeholder.com/800'})` }}
                />
                <div className="absolute inset-x-0 bottom-0 p-6 bg-gradient-to-t from-black/60 to-transparent">
                  <p className="text-[10px] text-[#4a5d4e] font-bold uppercase tracking-[0.2em] mb-1">New Arrival</p>
                  <h2 className="text-2xl font-bold tracking-tight uppercase">{hero.name}</h2>
                  <div className="mt-2 text-xs font-medium text-white/80">{hero.category || 'Tech Textile'}</div>
                </div>
              </div>
            </Link>
          </section>
        )}

        {!loading && products.length === 0 && (
          <div className="p-6 text-sm text-white/60">Товаров пока нет. Добавьте в админке.</div>
        )}

        <div className="px-0">
          {list.map(product => (
            <article key={product._id} className="flex flex-col mb-12">
              <Link to={`/product/${product._id}`} className="block">
                <div className="bg-[#f4f4f4] aspect-square overflow-hidden flex items-center justify-center relative">
                  <div
                    className="w-full h-full bg-contain bg-no-repeat bg-center mix-blend-multiply opacity-90 p-8"
                    style={{ backgroundImage: `url(${product.images?.[0] || 'https://via.placeholder.com/600'})` }}
                  />
                </div>
              </Link>
              <div className="px-4 mt-4 flex justify-between items-end">
                <div className="flex flex-col">
                  <h3 className="text-base font-bold uppercase tracking-tight">{product.name}</h3>
                  <p className="text-xs text-white/50 mt-1 uppercase">{product.category || 'Accessory'}</p>
                </div>
                <div className="text-base font-bold text-[#4a5d4e]">{product.price} ₽</div>
              </div>
            </article>
          ))}
        </div>
      </main>

      <nav className="fixed bottom-0 left-0 right-0 z-50 bg-[#1a1c1a] border-t border-white/5">
        <div className="flex items-center justify-around h-16 px-4">
          <button className="flex flex-col items-center justify-center text-[#4a5d4e]">
            <span className="material-symbols-outlined text-[26px]">grid_view</span>
            <span className="text-[9px] font-medium mt-0.5 uppercase">Shop</span>
          </button>
          <button className="flex flex-col items-center justify-center text-white/40">
            <span className="material-symbols-outlined text-[26px]">explore</span>
            <span className="text-[9px] font-medium mt-0.5 uppercase">Atlas</span>
          </button>
          <button className="flex flex-col items-center justify-center text-white/40">
            <span className="material-symbols-outlined text-[26px]">bookmark</span>
            <span className="text-[9px] font-medium mt-0.5 uppercase">Saved</span>
          </button>
          <button className="flex flex-col items-center justify-center text-white/40">
            <span className="material-symbols-outlined text-[26px]">account_circle</span>
            <span className="text-[9px] font-medium mt-0.5 uppercase">User</span>
          </button>
        </div>
      </nav>

      <div className="fixed left-0 top-1/2 -rotate-90 origin-left pointer-events-none opacity-20 hidden sm:block">
        <span className="text-[8px] tracking-[0.5em] text-white whitespace-nowrap uppercase">GEO: 35.6895° N / SIG: ACTIVE</span>
      </div>
    </div>
  );
};

export default Home;
