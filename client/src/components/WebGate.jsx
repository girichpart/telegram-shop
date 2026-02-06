import React, { useEffect, useMemo, useRef, useState } from 'react';

const WebGate = ({ settings }) => {
  const videoRef = useRef(null);
  const [videoReady, setVideoReady] = useState(false);
  const [videoError, setVideoError] = useState(false);
  const botUsername = import.meta.env.VITE_TELEGRAM_BOT_USERNAME;

  const heroMedia = useMemo(() => {
    if (settings?.heroVideoUrl) return settings.heroVideoUrl;
    if (import.meta.env.VITE_HOME_MEDIA_URL) return import.meta.env.VITE_HOME_MEDIA_URL;
    return '/hero.mp4';
  }, [settings?.heroVideoUrl]);

  const heroIsVideo = typeof heroMedia === 'string' && /\.(mp4|mov|webm)$/i.test(heroMedia);
  const heroIsMov = typeof heroMedia === 'string' && heroMedia.toLowerCase().endsWith('.mov');
  const heroVideoType = heroIsMov ? 'video/quicktime' : 'video/mp4';
  const heroSrc = heroMedia.startsWith('http')
    ? heroMedia
    : `${window.location.origin}${heroMedia.startsWith('/') ? '' : '/'}${heroMedia}`;

  useEffect(() => {
    if (!videoRef.current || !heroIsVideo) return;
    videoRef.current.play().catch(() => undefined);
  }, [heroIsVideo, heroSrc]);

  const telegramUrl = botUsername ? `https://t.me/${botUsername}` : '';

  return (
    <div
      className="relative min-h-screen w-full overflow-hidden bg-black text-white"
      style={{ minHeight: '100svh' }}
    >
      <div className="absolute inset-0">
        {heroIsVideo && !videoError ? (
          <video
            ref={videoRef}
            className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-700 ${videoReady ? 'opacity-100' : 'opacity-0'}`}
            autoPlay
            muted
            loop
            playsInline
            preload="metadata"
            onLoadedData={() => setVideoReady(true)}
            onError={() => setVideoError(true)}
            src={heroSrc}
          >
            <source src={heroSrc} type={heroVideoType} />
          </video>
        ) : (
          <div className="absolute inset-0 bg-black" />
        )}
        <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-black/40 to-black/70" />
      </div>
      <div
        className="relative z-10 flex min-h-screen flex-col items-center justify-center px-6 text-center"
        style={{ minHeight: '100svh' }}
      >
        <div className="max-w-[520px]">
          <p className="text-[11px] uppercase tracking-[0.3em] opacity-70">
            Доступно только в Telegram
          </p>
          <h1 className="mt-4 text-[22px] uppercase tracking-[0.2em]">
            {settings?.heroTitle || 'grått'}
          </h1>
          {telegramUrl ? (
            <a
              href={telegramUrl}
              className="mt-8 inline-flex items-center justify-center rounded-full border border-white/40 bg-white/5 px-8 py-3 text-[11px] uppercase tracking-[0.3em] transition hover:bg-white/15"
            >
              Перейти в Telegram
            </a>
          ) : (
            <>
              <button
                type="button"
                className="mt-8 inline-flex cursor-not-allowed items-center justify-center rounded-full border border-white/30 bg-white/5 px-8 py-3 text-[11px] uppercase tracking-[0.3em] opacity-60"
                disabled
              >
                Перейти в Telegram
              </button>
              <p className="mt-4 text-[11px] uppercase tracking-[0.2em] opacity-60">
                Укажи VITE_TELEGRAM_BOT_USERNAME в env
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default WebGate;
