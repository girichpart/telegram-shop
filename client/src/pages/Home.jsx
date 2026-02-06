import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api';
import SiteShell from '../components/SiteShell.jsx';

const Home = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [openIndex, setOpenIndex] = useState(0);
  const [videoError, setVideoError] = useState(false);
  const [videoBlocked, setVideoBlocked] = useState(false);
  const [videoRetryKey, setVideoRetryKey] = useState(0);
  const [videoReady, setVideoReady] = useState(false);
  const [heroVisible, setHeroVisible] = useState(true);
  const [loadError, setLoadError] = useState('');
  const [settings, setSettings] = useState(null);
  const [settingsError, setSettingsError] = useState('');
  const videoRef = useRef(null);
  const heroRef = useRef(null);
  const heroType = import.meta.env.VITE_HOME_MEDIA_TYPE || 'image';
  const heroUrl = import.meta.env.VITE_HOME_MEDIA_URL;
  const heroTitle = settings?.heroTitle ?? import.meta.env.VITE_HOME_MEDIA_TITLE ?? 'grått';
  const heroSubtitle = settings?.heroSubtitle ?? import.meta.env.VITE_HOME_MEDIA_SUBTITLE ?? 'Новая коллекция / Systems';
  const heroDescription = settings?.heroDescription ?? 'Городская экипировка, собранная как система.';
  const heroTextScale = settings?.heroTextScale ?? 1;
  const heroTextColor = settings?.heroTextColor ?? '#ffffff';
  const heroTextOpacity = settings?.heroTextOpacity ?? 0.85;

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

  const loadSettings = useCallback(async () => {
    try {
      const res = await api.get('/api/settings', { params: { ts: Date.now() } });
      setSettings(res.data || null);
      setSettingsError('');
    } catch (err) {
      console.error(err);
      setSettingsError('Не удалось загрузить настройки витрины');
    }
  }, []);

  useEffect(() => {
    loadSettings();
    const handleFocus = () => loadSettings();
    const handleVisibility = () => {
      if (document.visibilityState === 'visible') {
        loadSettings();
      }
    };
    const interval = setInterval(loadSettings, 30000);
    window.addEventListener('focus', handleFocus);
    document.addEventListener('visibilitychange', handleVisibility);
    return () => {
      clearInterval(interval);
      window.removeEventListener('focus', handleFocus);
      document.removeEventListener('visibilitychange', handleVisibility);
    };
  }, [loadSettings]);

  const defaultVideo = typeof window !== 'undefined' ? `${window.location.origin}/hero.mp4` : '/hero.mp4';
  const heroMedia = settings?.heroVideoUrl ?? heroUrl ?? defaultVideo ?? products?.[0]?.images?.[0];
  const heroIsVideoFile = typeof heroMedia === 'string' && /\.(mp4|mov|webm)$/i.test(heroMedia);
  const resolvedHeroType = heroIsVideoFile ? 'video' : heroType;
  const heroIsMov = typeof heroMedia === 'string' && heroMedia.toLowerCase().endsWith('.mov');
  const heroVideoType = heroIsMov ? 'video/quicktime' : 'video/mp4';
  const encodedMedia = heroMedia ? encodeURI(heroMedia) : '';
  const heroSrc = heroMedia
    ? typeof window !== 'undefined'
      ? encodedMedia.startsWith('http')
        ? encodedMedia
        : `${window.location.origin}${encodedMedia.startsWith('/') ? '' : '/'}${encodedMedia}`
      : encodedMedia
    : '';
  const heroFallbackImage = products?.[0]?.images?.[0] || '';
  const isVideo = heroMedia && resolvedHeroType === 'video' && !videoError;

  useEffect(() => {
    if (!heroRef.current) return undefined;
    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        setHeroVisible(entry.isIntersecting);
      },
      { threshold: 0.2 }
    );
    observer.observe(heroRef.current);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!isVideo) return;
    const videoEl = videoRef.current;
    if (!videoEl) return;
    if (!heroVisible) {
      videoEl.pause();
      return;
    }
    const attemptPlay = async () => {
      try {
        await videoEl.play();
        setVideoBlocked(false);
      } catch (err) {
        setVideoBlocked(true);
      }
    };
    attemptPlay();
  }, [isVideo, heroSrc, heroVisible]);
  const accordions = [
    {
      title: 'Материалы и уход',
      body: 'Мы используем износостойкие ткани с защитой от влаги. Рекомендуем деликатную стирку при низкой температуре.'
    },
    {
      title: 'Доставка СДЭК',
      body: 'Доступны ПВЗ и курьер. Стоимость и сроки рассчитываются автоматически на этапе оформления.'
    },
    {
      title: 'Оплата ЮKassa',
      body: 'Оплата проходит через ЮKassa. После подтверждения вы получите уведомление и номер заказа.'
    }
  ];

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

  const visibleProducts = products.filter(p => p.isActive !== false);

  return (
    <SiteShell headerVariant="site" headerTitle="grått" showNotice={false} headerOverlay headerTransparent>
      <section ref={heroRef} className="relative h-[100svh] w-full pns-reveal" data-reveal>
        <div className="absolute inset-0">
          {isVideo && (
            <video
              ref={videoRef}
              key={videoRetryKey}
              className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-700 ${videoReady ? 'opacity-100' : 'opacity-0'}`}
              autoPlay
              muted
              loop
              playsInline
              preload="metadata"
              poster={heroFallbackImage}
              onError={() => setVideoError(true)}
              onLoadedData={() => setVideoReady(true)}
              src={heroSrc}
            >
              <source src={heroSrc} type={heroVideoType} />
            </video>
          )}
          {isVideo && videoBlocked && (
            <button
              type="button"
              onClick={async () => {
                try {
                  await videoRef.current?.play();
                  setVideoBlocked(false);
                } catch (err) {
                  console.error(err);
                }
              }}
              className="absolute inset-0 z-10 flex items-center justify-center bg-black/40 text-[11px] uppercase tracking-[0.3em] text-white"
            >
              Нажмите, чтобы воспроизвести
            </button>
          )}
          {(heroMedia && resolvedHeroType !== 'video') || videoError ? (
            heroFallbackImage ? (
              <img src={heroFallbackImage} alt={heroTitle} className="absolute inset-0 h-full w-full object-cover" />
            ) : null
          ) : null}
          {videoError && (
            <button
              type="button"
              onClick={() => {
                setVideoError(false);
                setVideoRetryKey(prev => prev + 1);
              }}
              className="absolute bottom-6 right-6 z-10 rounded-full border border-white/40 px-4 py-2 text-[10px] uppercase tracking-[0.3em] text-white"
            >
              Повторить видео
            </button>
          )}
          {!heroMedia && (
            <div className="absolute inset-0 bg-gradient-to-b from-black/10 to-black/60"></div>
          )}
          <div className="absolute inset-0 bg-gradient-to-b from-black/10 via-black/30 to-black/70"></div>
        </div>
        <div className="absolute inset-0 flex items-center justify-center px-6 text-center">
          <div
            className="max-w-[720px] pns-fade-up"
            style={{ color: heroTextColor, opacity: heroTextOpacity }}
          >
            <p
              className="uppercase tracking-[0.3em]"
              style={{ fontSize: `${11 * heroTextScale}px` }}
            >
              {heroSubtitle}
            </p>
            <h1
              className="mt-3"
              style={{ fontSize: `${28 * heroTextScale}px`, lineHeight: 1.1, letterSpacing: '0.04em' }}
            >
              {heroTitle}
            </h1>
            <p
              className="mt-3"
              style={{ fontSize: `${12 * heroTextScale}px`, lineHeight: 1.4, letterSpacing: '0.04em' }}
            >
              {heroDescription}
            </p>
            {settingsError && (
              <p className="mt-4 text-[11px] uppercase tracking-[0.2em] text-white/70">{settingsError}</p>
            )}
          </div>
        </div>
      </section>

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
            const soldOut = sizeStock.every(stock => stock <= 0);
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
                </div>
                <span>{product.price} ₽</span>
              </div>
            </article>
          )})}
        </div>
      </section>

      <section className="px-5 pb-16 pns-reveal" data-reveal>
        <p className="text-[11px] uppercase tracking-[0.3em] opacity-60">Информация</p>
        <div className="mt-4 grid gap-3">
          {accordions.map((item, index) => (
            <button
              key={item.title}
              type="button"
              onClick={() => setOpenIndex(index === openIndex ? -1 : index)}
              className="w-full rounded-sm border border-black/10 bg-white px-4 py-4 text-left text-[12px] uppercase tracking-[0.25em]"
            >
              <div className="flex items-center justify-between">
                <span>{item.title}</span>
                <span>{openIndex === index ? '−' : '+'}</span>
              </div>
              <div className={`pns-accordion ${openIndex === index ? 'open' : ''}`}>
                <p className="mt-3 text-[11px] uppercase tracking-[0.2em] opacity-60">
                  {item.body}
                </p>
              </div>
            </button>
          ))}
        </div>
      </section>
    </SiteShell>
  );
};

export default Home;
