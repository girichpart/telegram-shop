# Admin (Strapi CMS для Telegram-магазина)

Это админ-панель на Strapi для управления товарами, заказами. Интегрируется с backend для API.

## Setup
1. Скопируй .env.example в .env и заполни (DB_URL, etc.).
2. `npm install`
3. `npm run develop`

## Features
- Управление продуктами и заказами.
- Поддержка PostgreSQL.
- Интеграция с CDEK/Yookassa через custom lifecycle (добавь в src/api/order/lifecycles.js).

См. docs.strapi.io для деталей.
