const axios = require('axios');

const getToken = () => process.env.TELEGRAM_BOT_TOKEN || process.env.BOT_TOKEN;
const isEnabled = () => Boolean(getToken());

const buildApiUrl = (method) => {
  const token = getToken();
  return `https://api.telegram.org/bot${token}/${method}`;
};

const sendMessage = async (chatId, text) => {
  if (!isEnabled() || !chatId) return;
  try {
    await axios.post(buildApiUrl('sendMessage'), {
      chat_id: chatId,
      text,
      parse_mode: 'HTML',
      disable_web_page_preview: true
    });
  } catch (err) {
    console.error('Telegram notify error:', err.response?.data || err.message);
  }
};

const formatMoney = (value) => {
  if (typeof value !== 'number') return `${value || 0}`;
  return value.toLocaleString('ru-RU');
};

const formatOrderLines = (order) => {
  const items = order.products || [];
  if (!items.length) return '';
  return items.map(item => `• ${item.name} × ${item.quantity}${item.size ? ` (${item.size})` : ''}`).join('\n');
};

const formatDeliveryStatus = (status) => {
  if (!status) return 'обновлено';
  const value = String(status).toLowerCase();
  if (value.includes('delivered')) return 'доставлено';
  if (value.includes('issue') || value.includes('ready')) return 'готово к выдаче';
  if (value.includes('transit') || value.includes('transport')) return 'в пути';
  if (value.includes('created')) return 'создано';
  return value.replace(/[_-]+/g, ' ');
};

const notifyOrder = async (order, type, extra = {}) => {
  if (!order) return;

  const adminChatId = process.env.TELEGRAM_ADMIN_CHAT_ID;
  const customerChatId = order.telegram?.id;

  const baseLines = [
    `<b>grått</b>`,
    `Заказ #${order._id?.toString().slice(-6)}`,
    `Сумма: ${formatMoney(order.totalAmount)} ₽`
  ];

  let statusLine = 'Статус: оформлен';
  if (type === 'paid') statusLine = 'Статус: оплачен';
  if (type === 'canceled') statusLine = 'Статус: отменен';
  if (type === 'delivery') statusLine = `Доставка: ${formatDeliveryStatus(extra.deliveryStatus)}`;

  const lines = [
    ...baseLines,
    statusLine
  ];

  const itemsBlock = formatOrderLines(order);
  if (itemsBlock) {
    lines.push('', itemsBlock);
  }

  if (extra.trackingNumber) {
    lines.push('', `Трек-номер СДЭК: ${extra.trackingNumber}`);
  }

  if (extra.paymentId) {
    lines.push(`ЮKassa платеж: ${extra.paymentId}`);
  }

  if (extra.receiptUrl) {
    lines.push(`Чек: ${extra.receiptUrl}`);
  }

  const message = lines.join('\n');

  await sendMessage(customerChatId, message);
  if (adminChatId) {
    const adminLines = [
      `[ADMIN]`,
      message
    ];
    if (type === 'delivery' && extra.deliveryStatus) {
      adminLines.push(`RAW CDEK: ${extra.deliveryStatus}`);
    }
    await sendMessage(adminChatId, adminLines.join('\n'));
  }
};

module.exports = {
  notifyOrder
};
