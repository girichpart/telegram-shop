import React from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import SiteShell from '../components/SiteShell.jsx';

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
    body: 'Elements is a compact technical shop built for Telegram. The interface is tuned for quick ordering.'
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
    <SiteShell headerVariant="back" headerTitle={info.title} showFooter onBack={() => navigate(-1)}>
      <div className="px-5 pb-16">
        <div className="mt-8 border border-black/10 bg-white p-6">
          <p className="text-[11px] uppercase tracking-[0.3em] opacity-60">{info.title}</p>
          <p className="mt-4 text-[13px] leading-relaxed opacity-70">{info.body}</p>
        </div>
      </div>
    </SiteShell>
  );
};

export default Info;
