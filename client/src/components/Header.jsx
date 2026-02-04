import React from 'react';
import { Link } from 'react-router-dom';
import { useCart } from '../context/CartContext.jsx';

const Header = ({ variant = 'site', title = 'Elements', showNotice = true, onBack }) => {
  const { count } = useCart();

  if (variant === 'back') {
    return (
      <header className="sticky top-0 z-30 w-full border-b border-black/10 bg-[--secondary]">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-3">
          <button
            type="button"
            onClick={onBack}
            className="flex items-center gap-2 text-[11px] uppercase tracking-[0.25em]"
          >
            <span className="inline-block h-[1px] w-6 bg-[--primary]"></span>
            Back
          </button>
          <p className="heading-6 uppercase tracking-[0.3em]">{title}</p>
          <Link to="/cart" className="text-[11px] uppercase tracking-[0.25em]">
            Cart ({count})
          </Link>
        </div>
      </header>
    );
  }

  return (
    <div className="fixed top-0 z-30 w-full">
      {showNotice && (
        <div className="flex w-full items-center justify-between bg-[--primary] px-5 py-[10px] text-[11px] uppercase tracking-[0.3em] text-[--primary-foreground]">
          <p className="truncate">Join ICC and receive 10% off your first order</p>
          <span className="text-[10px] opacity-60">×</span>
        </div>
      )}
      <nav className="isolate flex items-center justify-between border-b border-black/10 bg-[--secondary] px-5 py-3 text-[11px] uppercase tracking-[0.25em]">
        <div className="flex items-center gap-4">
          <Link to="/">Shop</Link>
          <Link to="/track">Tracking</Link>
        </div>
        <Link to="/" className="heading-6 uppercase tracking-[0.3em]">
          {title}
        </Link>
        <div className="flex items-center gap-4">
          <Link to="/cart">Cart ({count})</Link>
        </div>
      </nav>
    </div>
  );
};

export default Header;
