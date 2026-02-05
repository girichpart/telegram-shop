import React from 'react';
import { Link } from 'react-router-dom';

const Footer = () => {
  return (
    <footer className="mt-20 border-t border-black/10 bg-[--secondary]">
      <div className="mx-auto w-full max-w-6xl px-5 py-12">
        <div className="grid gap-10 text-[11px] uppercase tracking-[0.24em] md:grid-cols-3">
          <div>
            <p className="mb-4 text-[10px] opacity-50">Покупателям</p>
            <div className="flex flex-col gap-2">
              <Link to="/info/shipping">Доставка</Link>
              <Link to="/info/returns">Возвраты</Link>
              <Link to="/info/faq">Вопросы</Link>
            </div>
          </div>
          <div>
            <p className="mb-4 text-[10px] opacity-50">О магазине</p>
            <div className="flex flex-col gap-2">
              <Link to="/info/about">О нас</Link>
              <Link to="/info/privacy">Политика</Link>
              <Link to="/info/terms">Условия</Link>
            </div>
          </div>
          <div>
            <p className="mb-4 text-[10px] opacity-50">Контакты</p>
            <div className="flex flex-col gap-2">
              <span className="opacity-70">Поддержка: hello@shop.dev</span>
              <span className="opacity-70">Telegram mini app</span>
            </div>
          </div>
        </div>
        <p className="mt-10 text-[10px] uppercase tracking-[0.28em] opacity-40">
          grått · тестовая витрина
        </p>
      </div>
    </footer>
  );
};

export default Footer;
