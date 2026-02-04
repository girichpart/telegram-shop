import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api';
import SiteShell from '../components/SiteShell.jsx';

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
        setProducts(res.data || []);
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
    <SiteShell headerVariant="site" headerTitle="Elements" showNotice>
      <section className="px-5 pt-8">
        <div className="relative h-[60svh] overflow-hidden rounded-md border border-black/10 bg-black/5">
          {heroMedia && resolvedHeroType === 'video' && (
            <video
              className="absolute inset-0 h-full w-full object-cover"
              autoPlay
              muted
              loop
              playsInline
            >
              <source src={heroMedia} type="video/mp4" />
            </video>
          )}
          {heroMedia && resolvedHeroType !== 'video' && (
            <img src={heroMedia} alt={heroTitle} className="absolute inset-0 h-full w-full object-cover" />
          )}
          {!heroMedia && (
            <div className="absolute inset-0 bg-gradient-to-b from-black/10 to-black/60"></div>
          )}
          <div className="absolute inset-0 bg-gradient-to-b from-black/10 via-black/20 to-black/60"></div>
          <div className="absolute bottom-6 left-6 right-6 text-white pns-fade-up">
            <p className="text-[11px] uppercase tracking-[0.3em] opacity-70">{heroSubtitle}</p>
            <h1 className="heading-md mt-3">{heroTitle}</h1>
            <p className="t-small mt-2 opacity-80">Curated technical layers for everyday movement.</p>
          </div>
        </div>
      </section>

      <section className="px-5 py-12">
        <div className="flex items-center justify-between">
          <p className="text-[11px] uppercase tracking-[0.3em] opacity-60">Shop</p>
          <p className="text-[11px] uppercase tracking-[0.3em] opacity-60">{products.length} items</p>
        </div>
        {loading && (
          <div className="mt-6 text-[12px] uppercase tracking-[0.24em] opacity-50">Loading...</div>
        )}
        {!loading && products.length === 0 && (
          <div className="mt-6 text-[12px] uppercase tracking-[0.24em] opacity-50">No products yet.</div>
        )}
        <div className="mt-8 grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          {products.map(product => (
            <article key={product._id} className="group flex h-full flex-col gap-4">
              <Link to={`/product/${product._id}`} className="group relative overflow-hidden rounded-md border border-black/10 bg-black/5">
                <div className="absolute left-[0.3125rem] top-[0.3125rem] z-[3]">
                  <div className="inline-flex items-center justify-center rounded-sm border border-black/10 bg-white px-1.5 pb-0.5 pt-[0.1875rem] text-[0.625rem] uppercase leading-none">
                    New Arrival
                  </div>
                </div>
                <div className="aspect-[4/5] w-full overflow-hidden">
                  <img
                    src={product.images?.[0] || 'https://via.placeholder.com/800'}
                    alt={product.name}
                    className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-[1.03]"
                  />
                </div>
              </Link>
              <div className="flex items-center justify-between text-[12px] uppercase tracking-[0.2em]">
                <div>
                  <p className="opacity-50">{product.category || 'Technical / Core'}</p>
                  <h3 className="mt-2 text-[13px] tracking-[0.25em]">{product.name}</h3>
                </div>
                <span>{product.price} ₽</span>
              </div>
            </article>
          ))}
        </div>
      </section>
    </SiteShell>
  );
};

export default Home;
