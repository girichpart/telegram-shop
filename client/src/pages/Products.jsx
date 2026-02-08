import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api';
import SiteShell from '../components/SiteShell.jsx';

const Products = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState('');

  useEffect(() => {
    const loadProducts = async () => {
      try {
        const res = await api.get('/api/products');
        setProducts(res.data || []);
        setLoadError('');
      } catch (err) {
        try {
          const fallback = await fetch('/api/products');
          const data = await fallback.json();
          setProducts(Array.isArray(data) ? data : []);
          setLoadError('');
        } catch (fallbackErr) {
          console.error(fallbackErr);
          setLoadError('Не удалось загрузить каталог');
        }
      } finally {
        setLoading(false);
      }
    };

    loadProducts();
  }, []);

  useEffect(() => {
    const elements = Array.from(document.querySelectorAll('[data-reveal]'));
    if (!elements.length) return undefined;
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible');
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.2 }
    );
    elements.forEach(el => observer.observe(el));
    return () => observer.disconnect();
  }, [products]);

  const visibleProducts = products;

  return (
    <SiteShell headerVariant="site" headerTitle="grått" showNotice={false}>
      <section className="px-5 py-12 pns-reveal" data-reveal>
        <div className="pns-sticky flex items-center justify-between">
          <p className="text-[11px] uppercase tracking-[0.3em] opacity-60">Каталог</p>
          <p className="text-[11px] uppercase tracking-[0.3em] opacity-60">{visibleProducts.length} товаров</p>
        </div>
        {loading && (
          <div className="mt-6 text-[12px] uppercase tracking-[0.24em] opacity-50">Загрузка...</div>
        )}
        {!loading && products.length === 0 && (
          <div className="mt-6 text-[12px] uppercase tracking-[0.24em] opacity-50">Товаров пока нет.</div>
        )}
        {!loading && loadError && (
          <div className="mt-6 text-[12px] uppercase tracking-[0.24em] text-red-500">{loadError}</div>
        )}
        <div className="mt-8 grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          {visibleProducts.map((product, index) => {
            const sizeStock = Array.isArray(product.sizes) && product.sizes.length > 0
              ? product.sizes.map(s => s.stock || 0)
              : [product.stock || 0];
            const totalStock = sizeStock.reduce((sum, s) => sum + s, 0);
            const soldOut = sizeStock.every(stock => stock <= 0) || product.isActive === false;
            const showLastOne = totalStock === 1;
            return (
            <article
              key={product._id}
              className="group flex h-full flex-col gap-4 pns-reveal"
              data-reveal
              style={{ '--reveal-delay': `${index * 70}ms` }}
            >
              <Link to={`/product/${product._id}`} className="group relative overflow-hidden rounded-md border border-black/10 bg-black/5">
                {(product.statusTags || []).length > 0 && (
                  <div className="absolute left-[0.3125rem] top-[0.3125rem] z-[3] flex flex-wrap gap-1">
                    {(product.statusTags || []).slice(0, 2).map(tag => (
                      <div
                        key={tag}
                        className="inline-flex items-center justify-center rounded-sm border border-black/10 bg-white px-1.5 pb-0.5 pt-[0.1875rem] text-[0.625rem] uppercase leading-none"
                      >
                        {tag}
                      </div>
                    ))}
                  </div>
                )}
                {soldOut && (
                  <div className="absolute inset-0 z-[4] flex items-center justify-center bg-white/50 text-[12px] uppercase tracking-[0.3em] text-black backdrop-blur">
                    SOLD OUT
                  </div>
                )}
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
                  <p className="opacity-50">{product.category || 'Техническая линейка'}</p>
                  <h3 className="mt-2 text-[13px] tracking-[0.25em]">{product.name}</h3>
                  {showLastOne && !soldOut && (
                    <p className="mt-2 text-[10px] uppercase tracking-[0.3em] text-red-500">Осталась 1 штука</p>
                  )}
                </div>
                <span>{product.price} ₽</span>
              </div>
            </article>
          )})}
        </div>
      </section>
    </SiteShell>
  );
};

export default Products;
