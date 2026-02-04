import React from 'react';
import { useNavigate, useParams } from 'react-router-dom';

const infoMap = {
  shipping: {
    title: 'Shipping',
    body: 'Orders are prepared within 1-2 business days. Courier and pickup options are calculated at checkout.'
  },
  returns: {
    title: 'Returns',
    body: 'Returns are accepted within 14 days in original condition. To start a return, contact support.'
  },
  faq: {
    title: 'FAQ',
    body: 'Questions about sizing, delivery, and payments? Reach out via support and we will help you quickly.'
  },
  about: {
    title: 'About',
    body: 'grått is a compact technical shop for modern essentials. Built to work perfectly inside Telegram.'
  },
  privacy: {
    title: 'Privacy',
    body: 'We store only what is required to fulfill your order. Data is not shared with third parties.'
  },
  terms: {
    title: 'Terms',
    body: 'All purchases are subject to availability. Prices include applicable taxes and fees.'
  }
};

const Info = () => {
  const navigate = useNavigate();
  const { slug } = useParams();
  const info = infoMap[slug] || {
    title: 'Info',
    body: 'Page not found.'
  };

  return (
    <div className="min-h-screen" style={{ background: 'var(--tma-bg)', color: 'var(--tma-text)' }}>
      <header
        className="sticky top-0 z-50 backdrop-blur-md px-4 py-3 flex items-center justify-between border-b"
        style={{ borderColor: 'var(--tma-border)', background: 'var(--tma-bg)' }}
      >
        <div className="flex items-center gap-3" onClick={() => navigate(-1)}>
          <span className="material-symbols-outlined" style={{ color: 'var(--tma-link)' }}>chevron_left</span>
          <span style={{ color: 'var(--tma-link)' }} className="font-medium">Back</span>
        </div>
        <h1 className="text-lg font-medium tracking-tight lowercase">grått</h1>
        <div className="w-10"></div>
      </header>

      <main className="max-w-md mx-auto w-full pt-6 pb-20 px-5">
        <h2 className="section-label">{info.title}</h2>
        <div className="mt-4 rounded-2xl border bg-white p-5 text-sm leading-relaxed" style={{ borderColor: 'var(--tma-border)' }}>
          {info.body}
        </div>
      </main>
    </div>
  );
};

export default Info;
