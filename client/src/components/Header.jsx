import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useCart } from '../context/CartContext.jsx';

const IconButton = ({ children, label, className = '' }) => (
  <span className={`flex h-9 w-9 items-center justify-center rounded-full border ${className}`} aria-hidden="true">
    {children}
    <span className="sr-only">{label}</span>
  </span>
);

const Header = ({ variant = 'site', title = 'grått', showNotice = true, onBack, transparent = false }) => {
  const { count } = useCart();
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const isTransparent = transparent && !scrolled;
  const iconClass = isTransparent
    ? 'border-white/30 bg-white/10 text-white backdrop-blur'
    : 'border-black/10 bg-white text-black';
  const navClass = isTransparent
    ? 'border-transparent bg-transparent text-white'
    : 'border-b border-black/10 bg-[--secondary] text-[--primary]';

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };
    handleScroll();
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  if (variant === 'back') {
    return (
      <header className="sticky top-0 z-30 w-full border-b border-black/10 bg-[--secondary]">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-3">
          <button type="button" onClick={onBack} aria-label="Назад">
            <IconButton label="Назад" className={iconClass}>
              <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M15 18l-6-6 6-6" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </IconButton>
          </button>
          <p className="heading-6 tracking-[0.1em]">{title}</p>
          <Link to="/cart" aria-label="Корзина">
            <IconButton label="Корзина" className={iconClass}>
              <div className="relative">
                <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <path d="M6 6h15l-1.5 9h-12z" strokeLinecap="round" strokeLinejoin="round" />
                  <path d="M6 6l-2-3H2" strokeLinecap="round" strokeLinejoin="round" />
                  <circle cx="9" cy="20" r="1" />
                  <circle cx="18" cy="20" r="1" />
                </svg>
                {count > 0 && (
                  <span className="absolute -right-2 -top-2 inline-flex h-4 min-w-[16px] items-center justify-center rounded-full bg-black px-1 text-[9px] text-white">
                    {count}
                  </span>
                )}
              </div>
            </IconButton>
          </Link>
        </div>
      </header>
    );
  }

  return (
    <div className="fixed top-0 z-30 w-full">
      {showNotice && (
        <div className="flex w-full items-center justify-between bg-[--primary] px-5 py-[10px] text-[11px] uppercase tracking-[0.3em] text-[--primary-foreground]">
          <p className="truncate">Скидка 10% на первый заказ</p>
          <span className="text-[10px] opacity-60">×</span>
        </div>
      )}
      <nav className={`relative isolate flex items-center justify-between px-5 py-3 transition-colors duration-300 ${navClass}`}>
        <div className="flex items-center gap-3">
          <button type="button" aria-label="Меню" onClick={() => setMenuOpen(prev => !prev)}>
            <IconButton label="Меню" className={iconClass}>
              <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M4 7h16" strokeLinecap="round" />
                <path d="M4 12h16" strokeLinecap="round" />
                <path d="M4 17h16" strokeLinecap="round" />
              </svg>
            </IconButton>
          </button>
          <Link to="/" aria-label="Главная">
            <IconButton label="Главная" className={iconClass}>
              <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M4 10.5l8-6 8 6" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M6 9.5v9h12v-9" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </IconButton>
          </Link>
        </div>
        <Link
          to="/"
          className="heading-6 tracking-[0.1em] absolute left-1/2 -translate-x-1/2 inline-flex items-center justify-center whitespace-nowrap px-2"
        >
          {title}
        </Link>
        <div className="flex items-center gap-3">
          <Link to="/account" aria-label="Профиль">
            <IconButton label="Профиль" className={iconClass}>
              <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.5">
                <circle cx="12" cy="8" r="3.5" />
                <path d="M5 20c1.8-3 4.5-4.5 7-4.5S17.2 17 19 20" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </IconButton>
          </Link>
          <Link to="/cart" aria-label="Корзина">
            <IconButton label="Корзина" className={iconClass}>
              <div className="relative">
                <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <path d="M6 6h15l-1.5 9h-12z" strokeLinecap="round" strokeLinejoin="round" />
                  <path d="M6 6l-2-3H2" strokeLinecap="round" strokeLinejoin="round" />
                  <circle cx="9" cy="20" r="1" />
                  <circle cx="18" cy="20" r="1" />
                </svg>
                {count > 0 && (
                  <span className="absolute -right-2 -top-2 inline-flex h-4 min-w-[16px] items-center justify-center rounded-full bg-black px-1 text-[9px] text-white">
                    {count}
                  </span>
                )}
              </div>
            </IconButton>
          </Link>
        </div>
      </nav>
      {menuOpen && (
        <div className="absolute left-0 right-0 top-full z-40 border-b border-black/10 bg-[--secondary] px-5 py-6 shadow-sm">
          <div className="grid gap-3 text-[12px] uppercase tracking-[0.25em]">
            <Link to="/" onClick={() => setMenuOpen(false)} className="opacity-70 hover:opacity-100">Главная</Link>
            <Link to="/catalog" onClick={() => setMenuOpen(false)} className="opacity-70 hover:opacity-100">Каталог</Link>
            <Link to="/account" onClick={() => setMenuOpen(false)} className="opacity-70 hover:opacity-100">Личный кабинет</Link>
            <Link to="/info/delivery" onClick={() => setMenuOpen(false)} className="opacity-70 hover:opacity-100">Доставка</Link>
            <Link to="/info/payment" onClick={() => setMenuOpen(false)} className="opacity-70 hover:opacity-100">Оплата</Link>
            <Link to="/info/returns" onClick={() => setMenuOpen(false)} className="opacity-70 hover:opacity-100">Возвраты</Link>
          </div>
        </div>
      )}
    </div>
  );
};

export default Header;
