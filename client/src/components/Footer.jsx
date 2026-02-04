import React from 'react';
import { Link } from 'react-router-dom';

const Footer = () => {
  return (
    <footer className="mt-20 border-t border-black/10 bg-[--secondary]">
      <div className="mx-auto w-full max-w-6xl px-5 py-12">
        <div className="grid gap-10 text-[11px] uppercase tracking-[0.24em] md:grid-cols-3">
          <div>
            <p className="mb-4 text-[10px] opacity-50">Customer Care</p>
            <div className="flex flex-col gap-2">
              <Link to="/info/shipping">Shipping</Link>
              <Link to="/info/returns">Returns</Link>
              <Link to="/info/faq">FAQ</Link>
            </div>
          </div>
          <div>
            <p className="mb-4 text-[10px] opacity-50">Company</p>
            <div className="flex flex-col gap-2">
              <Link to="/info/about">About</Link>
              <Link to="/info/privacy">Privacy</Link>
              <Link to="/info/terms">Terms</Link>
            </div>
          </div>
          <div>
            <p className="mb-4 text-[10px] opacity-50">Connect</p>
            <div className="flex flex-col gap-2">
              <span className="opacity-70">Support: hello@shop.dev</span>
              <span className="opacity-70">Telegram mini app</span>
            </div>
          </div>
        </div>
        <p className="mt-10 text-[10px] uppercase tracking-[0.28em] opacity-40">
          Elements Shop · Demo build
        </p>
      </div>
    </footer>
  );
};

export default Footer;
