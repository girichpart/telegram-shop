import React from 'react';
import { useParams } from 'react-router-dom';
import SiteShell from '../components/SiteShell.jsx';

const infoMap = {
  shipping: {
    title: 'Доставка',
    body: 'Заказы готовим в течение 1–2 рабочих дней. Доставка СДЭК рассчитывается на этапе оформления.'
  },
  returns: {
    title: 'Возвраты',
    body: 'Возврат возможен в течение 14 дней при сохранении состояния товара. Напишите в поддержку.'
  },
  faq: {
    title: 'Вопросы',
    body: 'Поможем с размером, доставкой и оплатой. Напишите в поддержку — ответим быстро.'
  },
  about: {
    title: 'О нас',
    body: 'grått — компактный магазин технических вещей для Telegram. Фокус на скорости и удобстве.'
  },
  privacy: {
    title: 'Политика',
    body: 'Мы храним только необходимые данные для выполнения заказа. Ничего не передаем третьим лицам.'
  },
  terms: {
    title: 'Условия',
    body: 'Все покупки зависят от наличия товара. Цены указаны с учетом применимых сборов.'
  }
};

const Info = () => {
  const { slug } = useParams();
  const info = infoMap[slug] || {
    title: 'Информация',
    body: 'Страница не найдена.'
  };

  return (
    <SiteShell headerVariant="site" headerTitle="grått" showFooter showNotice>
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
