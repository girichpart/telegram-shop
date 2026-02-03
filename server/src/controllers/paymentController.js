const YooKassa = require('yookassa');
const Order = require('../models/Order');

const isYooKassaEnabled = () => process.env.YOOKASSA_ENABLED === 'true';

const getYooKassaClient = () => new YooKassa({
  shopId: process.env.YOOKASSA_SHOP_ID,
  secretKey: process.env.YOOKASSA_SECRET_KEY
});

const getReturnUrl = (orderId) => {
  const base = process.env.APP_PUBLIC_URL || 'http://localhost:5173';
  return `${base}/success?orderId=${orderId}`;
};

exports.createPayment = async (req, res) => {
  const { orderId } = req.body;

  if (!orderId) {
    return res.status(400).json({ error: 'orderId обязателен' });
  }

  try {
    const order = await Order.findById(orderId);
    if (!order) return res.status(404).json({ error: 'Заказ не найден' });

    if (!isYooKassaEnabled()) {
      await Order.findByIdAndUpdate(orderId, {
        paymentStatus: 'paid',
        status: 'paid',
        payment: {
          provider: 'yookassa',
          status: 'paid',
          confirmationUrl: getReturnUrl(orderId),
          updatedAt: new Date()
        }
      });

      return res.json({
        status: 'paid',
        confirmationUrl: getReturnUrl(orderId)
      });
    }

    const yookassa = getYooKassaClient();

    const paymentData = {
      amount: {
        value: order.totalAmount.toFixed(2),
        currency: 'RUB'
      },
      capture: true,
      description: `Заказ #${orderId}`,
      confirmation: {
        type: 'redirect',
        return_url: getReturnUrl(orderId)
      },
      metadata: { orderId }
    };

    const idempotenceKey = `order-${orderId}-${Date.now()}`;
    const payment = await yookassa.createPayment(paymentData, idempotenceKey);

    await Order.findByIdAndUpdate(orderId, {
      paymentStatus: payment.status || 'pending',
      payment: {
        provider: 'yookassa',
        status: payment.status || 'pending',
        yookassaPaymentId: payment.id,
        confirmationUrl: payment.confirmation?.confirmation_url,
        lastEvent: 'payment.created',
        updatedAt: new Date()
      }
    });

    res.json({
      status: payment.status,
      paymentId: payment.id,
      confirmationUrl: payment.confirmation?.confirmation_url
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.webhook = async (req, res) => {
  const event = req.body;
  const payment = event?.object;
  const eventType = event?.event;

  if (!payment || !payment.metadata?.orderId) {
    return res.sendStatus(200);
  }

  const orderId = payment.metadata.orderId;

  let paymentStatus = 'pending';
  let orderStatus = 'new';

  if (eventType === 'payment.succeeded') {
    paymentStatus = 'paid';
    orderStatus = 'paid';
  } else if (eventType === 'payment.canceled') {
    paymentStatus = 'canceled';
    orderStatus = 'canceled';
  } else if (eventType === 'payment.waiting_for_capture') {
    paymentStatus = 'waiting_for_capture';
    orderStatus = 'pending';
  }

  await Order.findByIdAndUpdate(orderId, {
    paymentStatus,
    status: orderStatus,
    payment: {
      provider: 'yookassa',
      status: paymentStatus,
      yookassaPaymentId: payment.id,
      confirmationUrl: payment.confirmation?.confirmation_url,
      lastEvent: eventType,
      updatedAt: new Date()
    }
  });

  res.sendStatus(200);
};

exports.sendOrderConfirmation = async () => true;
