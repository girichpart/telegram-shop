# Webapp (Next.js for Telegram Mini App)

Фронтенд для Telegram-магазина: каталог, корзина, checkout с Yookassa/CDEK, отслеживание заказов.

## Setup
1. .env.local: NEXT_PUBLIC_BACKEND_URL=http://localhost:3000
2. `npm install`
3. `npm run dev`

## Features
- Каталог товаров (с размерами, цветами).
- Корзина (Zustand, persist).
- Checkout: Выбор доставки CDEK (ПВЗ, расчёт), оплата Yookassa (redirect).
- Отслеживание заказов по телефону.
- Telegram WebApp интеграция.