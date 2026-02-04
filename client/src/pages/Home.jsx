import React, { useEffect, useState } from 'react';
import api from '../api';
import { Link } from 'react-router-dom';

const Home = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const heroType = import.meta.env.VITE_HOME_MEDIA_TYPE || 'image';
  const heroUrl = import.meta.env.VITE_HOME_MEDIA_URL;
  const heroTitle = import.meta.env.VITE_HOME_MEDIA_TITLE || 'Elements Shop';
  const heroSubtitle = import.meta.env.VITE_HOME_MEDIA_SUBTITLE || 'New Arrival / Systems';

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

  const heroMedia = heroUrl || products?.[0]?.images?.[0];
  const resolvedHeroType = heroUrl ? heroType : 'image';

  return (
    <div className="min-h-screen font-['Inter']" style={{ background: 'var(--tma-bg)', color: 'var(--tma-text)' }}>
      <header className="sticky top-0 z-50 border-b" style={{ background: 'var(--tma-bg)', borderColor: 'var(--tma-border)' }}>
        <div className="flex items-center justify-between h-14 px-5">
          <div className="w-10"></div>
          <h1 className="text-lg font-medium tracking-tight lowercase">grått</h1>
          <div className="flex items-center justify-end w-10">
            <button className="flex items-center justify-center" aria-label="Search">
              <span className="material-symbols-outlined text-[20px] font-light">search</span>
            </button>
          </div>
        </div>
      </header>

      <main className="flex flex-col w-full pb-28">
        {heroMedia && (
          <section className="px-5 pt-5">
            <div className="relative overflow-hidden rounded-[28px] aspect-[4/5] bg-black/10 shadow-sm fade-in">
              {resolvedHeroType === 'video' ? (
                <video
                  className="absolute inset-0 h-full w-full object-cover"
                  autoPlay
                  muted
                  loop
                  playsInline
                >
                  <source src={heroMedia} type="video/mp4" />
                </video>
              ) : (
                <img src={heroMedia} alt={heroTitle} className="absolute inset-0 h-full w-full object-cover" />
              )}
              <div className="absolute inset-0" style={{ background: 'linear-gradient(180deg, rgba(0,0,0,0.15) 20%, var(--tma-hero-overlay) 100%)' }} />
              <div className="absolute bottom-5 left-5 right-5 text-white rise-in">
                <p className="text-[11px] uppercase tracking-[0.3em] text-white/70">{heroSubtitle}</p>
                <h2 className="text-2xl font-semibold mt-2">{heroTitle}</h2>
                <p className="text-sm text-white/70 mt-1">Curated technical layers for everyday movement.</p>
              </div>
            </div>
          </section>
        )}

        {loading && (
          <div className="px-6 pt-6 text-sm" style={{ color: 'var(--tma-muted)' }}>Загрузка...</div>
        )}

        <section className="flex flex-col gap-6 px-5 pt-6">
          {products.map(product => (
            <article key={product._id} className="flex flex-col bg-white rounded-[28px] overflow-hidden border shadow-sm" style={{ borderColor: 'var(--tma-border)' }}>
              <Link to={`/product/${product._id}`}>
                <div className="bg-[#e8e8e8] aspect-[3/4] overflow-hidden flex items-center justify-center relative">
                  <div
                    className="w-full h-full bg-cover bg-center"
                    style={{ backgroundImage: `url(${product.images?.[0] || 'https://via.placeholder.com/800'})` }}
                  />
                </div>
              </Link>
              <div className="p-6 flex flex-col">
                <div className="flex justify-between items-baseline mb-2">
                  <h3 className="text-sm font-semibold uppercase tracking-wide">{product.name}</h3>
                  <span className="text-sm font-medium">{product.price} ₽</span>
                </div>
                <p className="text-[11px] uppercase tracking-wider" style={{ color: 'var(--tma-muted)' }}>
                  {product.description || product.category || 'Technical / Neutral'}
                </p>
              </div>
            </article>
          ))}
        </section>

        {!loading && products.length === 0 && (
          <div className="px-6 pt-6 text-sm" style={{ color: 'var(--tma-muted)' }}>Товаров пока нет. Добавьте в админке.</div>
        )}

        <footer className="mt-12 px-5 pb-8">
          <div className="rounded-[24px] border bg-white p-6" style={{ borderColor: 'var(--tma-border)' }}>
            <div className="grid grid-cols-2 gap-6 text-sm">
              <div className="space-y-2">
                <p className="text-xs uppercase tracking-widest" style={{ color: 'var(--tma-muted)' }}>Customer Care</p>
                <Link to="/info/shipping" className="block">Shipping</Link>
                <Link to="/info/returns" className="block">Returns</Link>
                <Link to="/info/faq" className="block">FAQ</Link>
              </div>
              <div className="space-y-2">
                <p className="text-xs uppercase tracking-widest" style={{ color: 'var(--tma-muted)' }}>Company</p>
                <Link to="/info/about" className="block">About</Link>
                <Link to="/info/privacy" className="block">Privacy</Link>
                <Link to="/info/terms" className="block">Terms</Link>
              </div>
            </div>
            <div className="mt-6 text-xs" style={{ color: 'var(--tma-muted)' }}>
              Telegram mini app · demo build
            </div>
          </div>
        </footer>
      </main>

      <nav className="fixed bottom-0 left-0 right-0 z-50 border-t" style={{ background: 'var(--tma-surface)', borderColor: 'var(--tma-border)' }}>
        <div className="flex items-center justify-around h-16 px-4">
          <button className="flex flex-col items-center justify-center text-black">
            <span className="material-symbols-outlined text-[24px]">home</span>
          </button>
          <button className="flex flex-col items-center justify-center text-black/30">
            <span className="material-symbols-outlined text-[24px]">search</span>
          </button>
          <Link to="/cart" className="flex flex-col items-center justify-center text-black/30">
            <span className="material-symbols-outlined text-[24px]">favorite</span>
          </Link>
          <button className="flex flex-col items-center justify-center text-black/30">
            <span className="material-symbols-outlined text-[24px]">person</span>
          </button>
        </div>
      </nav>
    </div>
  );
};

export default Home;
