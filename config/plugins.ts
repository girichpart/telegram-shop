import type { Env } from '@strapi/utils';

export default ({ env }: { env: Env }) => ({
  email: {
    config: {
      provider: 'nodemailer',
      providerOptions: {
        host: env('SMTP_HOST', 'smtp.example.com'),
        port: env.int('SMTP_PORT', 587),
        auth: {
          user: env('SMTP_USERNAME'),
          pass: env('SMTP_PASSWORD'),
        },
      },
      settings: {
        defaultFrom: env('SMTP_FROM', 'no-reply@example.com'),
        defaultReplyTo: env('SMTP_REPLYTO', 'no-reply@example.com'),
      },
    },
  },
  // Добавь другие плагины, если есть
});