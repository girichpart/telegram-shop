# Telegram-Shop

Монопрепозиторий для Telegram-магазина: Strapi (admin), NestJS (backend), Next.js (webapp).

## Setup
1. `npm install` в root (установит все workspaces).
2. Скопируй .env.example в .env и заполни.
3. `npm run dev` (запустит все).

## Структура
- admin: Strapi CMS.
- backend: API с прокси Strapi, интеграцией CDEK/Yookassa.
- webapp: Front для Telegram Mini App.

## Интеграции
- CDEK: Расчёт доставки (backend/delivery).
- Yookassa: Платежи (backend/payments).

Лицензия: MIT.