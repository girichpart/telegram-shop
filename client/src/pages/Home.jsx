import React, { useEffect, useRef, useState } from 'react';
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
  const [loadError, setLoadError] = useState('');
  const [settings, setSettings] = useState(null);
  const [settingsError, setSettingsError] = useState('');
  const videoRef = useRef(null);
  const heroType = import.meta.env.VITE_HOME_MEDIA_TYPE || 'image';
  const heroUrl = import.meta.env.VITE_HOME_MEDIA_URL;
  const heroTitle = settings?.heroTitle || import.meta.env.VITE_HOME_MEDIA_TITLE || 'grått';
  const heroSubtitle = settings?.heroSubtitle || import.meta.env.VITE_HOME_MEDIA_SUBTITLE || 'Новая коллекция / Systems';
  const heroDescription = settings?.heroDescription || 'Городская экипировка, собранная как система.';

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
    const loadSettings = async () => {
      try {
        const res = await api.get('/api/settings');
        setSettings(res.data || null);
        setSettingsError('');
      } catch (err) {
        console.error(err);
        setSettingsError('Не удалось загрузить настройки витрины');
      }
    };

    loadSettings();
  }, []);

  const defaultVideo = typeof window !== 'undefined' ? `${window.location.origin}/hero.mp4` : '/hero.mp4';
  const heroMedia = settings?.heroVideoUrl || heroUrl || defaultVideo || products?.[0]?.images?.[0];
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
    if (!isVideo) return;
    const attemptPlay = async () => {
      const videoEl = videoRef.current;
      if (!videoEl) return;
      try {
        await videoEl.play();
        setVideoBlocked(false);
      } catch (err) {
        setVideoBlocked(true);
      }
    };
    attemptPlay();
  }, [isVideo, heroSrc]);
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

  return (
    <SiteShell headerVariant="site" headerTitle="grått" showNotice={false} headerOverlay headerTransparent>
      <section className="relative h-[100svh] w-full">
        <div className="absolute inset-0">
          {isVideo && (
            <video
              ref={videoRef}
              key={videoRetryKey}
              className="absolute inset-0 h-full w-full object-cover"
              autoPlay
              muted
              loop
              playsInline
              preload="auto"
              poster={heroFallbackImage}
              onError={() => setVideoError(true)}
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
        <div className="absolute inset-0 flex items-center justify-center px-6 text-center text-white">
          <div className="max-w-[720px] pns-fade-up">
            <p className="text-[11px] uppercase tracking-[0.3em] opacity-70">{heroSubtitle}</p>
            <h1 className="heading-md mt-3">{heroTitle}</h1>
            <p className="t-small mt-3 opacity-80">{heroDescription}</p>
            {settingsError && (
              <p className="mt-4 text-[11px] uppercase tracking-[0.2em] text-white/70">{settingsError}</p>
            )}
          </div>
        </div>
      </section>

      <section className="px-5 py-12">
        <div className="flex items-center justify-between">
          <p className="text-[11px] uppercase tracking-[0.3em] opacity-60">Каталог</p>
          <p className="text-[11px] uppercase tracking-[0.3em] opacity-60">{products.length} товаров</p>
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
          {products.map(product => (
            <article key={product._id} className="group flex h-full flex-col gap-4">
              <Link to={`/product/${product._id}`} className="group relative overflow-hidden rounded-md border border-black/10 bg-black/5">
                <div className="absolute left-[0.3125rem] top-[0.3125rem] z-[3]">
                  <div className="inline-flex items-center justify-center rounded-sm border border-black/10 bg-white px-1.5 pb-0.5 pt-[0.1875rem] text-[0.625rem] uppercase leading-none">
                    Новинка
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
                  <p className="opacity-50">{product.category || 'Техническая линейка'}</p>
                  <h3 className="mt-2 text-[13px] tracking-[0.25em]">{product.name}</h3>
                </div>
                <span>{product.price} ₽</span>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="px-5 pb-16">
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
              {openIndex === index && (
                <p className="mt-3 text-[11px] uppercase tracking-[0.2em] opacity-60">
                  {item.body}
                </p>
              )}
            </button>
          ))}
        </div>
      </section>
    </SiteShell>
  );
};

export default Home;
