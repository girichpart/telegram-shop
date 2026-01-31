import './globals.css';
import { init } from '@telegram-apps/sdk';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Telegram Shop',
  description: 'Магазин в Telegram',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  if (typeof window !== 'undefined') {
    init(); // Инициализация Telegram WebApp
    const tg = window.Telegram.WebApp;
    tg.ready();
    tg.expand();
  }
  return (
    <html lang="ru">
      <body>{children}</body>
    </html>
  );
}

