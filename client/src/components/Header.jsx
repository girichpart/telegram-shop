import React from 'react';
import { Link, NavLink } from 'react-router-dom';
import { useCart } from '../context/CartContext.jsx';

const Header = () => {
  const { count } = useCart();

  return (
    <header className="fixed top-0 left-0 right-0 z-20 backdrop-blur-lg border-b border-white/10 bg-ink/70">
      <div className="mx-auto max-w-6xl px-6 py-4 flex items-center justify-between">
        <Link to="/" className="text-lg tracking-[0.3em] uppercase font-semibold">.solutions</Link>
        <nav className="flex items-center gap-6 text-sm">
          <NavLink to="/track" className="text-sand/70 hover:text-sand">Tracking</NavLink>
          <NavLink to="/cart" className="text-sand/70 hover:text-sand">
            Cart <span className="ml-1 text-lime">({count})</span>
          </NavLink>
        </nav>
      </div>
    </header>
  );
};

export default Header;