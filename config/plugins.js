module.exports = ({ env }) => ({
  email: {
    config: {
      provider: 'nodemailer',
      providerOptions: {
        host: env('SMTP_HOST', 'smtp.example.com'),  // например, smtp.gmail.com
        port: env.int('SMTP_PORT', 587),
        auth: {
          user: env('SMTP_USERNAME'),
          pass: env('SMTP_PASSWORD'),
        },
        // ignoreTLS: true,  // если нужно для тестирования
      },
      settings: {
        defaultFrom: env('SMTP_FROM', 'no-reply@example.com'),
        defaultReplyTo: env('SMTP_REPLYTO', 'no-reply@example.com'),
      },
    },
  },
});