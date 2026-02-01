const YooKassa = require('yookassa');
const Order = require('../models/Order');
const nodemailer = require('nodemailer');

const yookassa = new YooKassa({
  shopId: process.env.YOOKASSA_SHOP_ID,
  secretKey: process.env.YOOKASSA_SECRET_KEY
});

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,  // 'smtp.yandex.com'
  port: process.env.EMAIL_PORT,  // 465
  secure: true,  // true для 465, false для 587 с TLS
  auth: {
    user: process.env.EMAIL_USER,  // ваша почта@yandex.ru
    pass: process.env.EMAIL_PASS   // пароль приложения
  }
});

exports.createPayment = async (req, res) => {
  const { orderId, amount } = req.body;

  try {
    const payment = await yookassa.createPayment({
      amount: {
        value: amount.toFixed(2),
        currency: 'RUB'
      },
      capture: true,
      description: `Заказ #${orderId}`,
      confirmation: {
        type: 'redirect',
        return_url: 'https://your-mini-app-url/success'  // Замените на реальный URL
      },
      metadata: { orderId }
    });

    await Order.findByIdAndUpdate(orderId, { paymentStatus: 'pending' });

    res.json({ confirmationUrl: payment.confirmation.confirmation_url });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.webhook = async (req, res) => {
  const event = req.body;
  if (event.object && event.object.status === 'succeeded') {
    const orderId = event.object.metadata.orderId;
    const order = await Order.findById(orderId);
    if (order) {
      await Order.findByIdAndUpdate(orderId, { paymentStatus: 'paid', status: 'paid' });
      await exports.sendOrderConfirmation(order, order.email);  // Вызов email, предполагаем email в Order
    }
  }
  res.sendStatus(200);
};

exports.sendOrderConfirmation = async (order, email) => {
  try {
    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: email,
      subject: `Подтверждение заказа #${order._id}`,
      text: `Спасибо за заказ! Сумма: ${order.totalAmount} руб. 
Статус: ${order.status}. 
Доставка: ${order.delivery.type} - ${order.delivery.address}, стоимость ${order.delivery.cost} руб.
Товары: ${order.products.map(p => `${p.productId.name || 'Товар'} x ${p.quantity}`).join(', ')}`,  // Исправьте на реальные имена товаров
      html: `<b>Спасибо за заказ!</b><p>Детали заказа: <ul><li>Сумма: ${order.totalAmount} руб.</li><li>Статус: ${order.status}</li></ul></p>`
    });
    console.log('Email успешно отправлен');
  } catch (err) {
    console.error('Ошибка отправки email:', err);
  }
};