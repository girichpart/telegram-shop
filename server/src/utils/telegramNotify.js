const axios = require('axios');
const Settings = require('../models/Settings');

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

const formatOrderStatus = (status) => {
  if (!status) return 'обновлено';
  const value = String(status).toLowerCase();
  if (value.includes('paid')) return 'оплачен';
  if (value.includes('cancel')) return 'отменен';
  if (value.includes('deliver')) return 'доставлен';
  if (value.includes('ship')) return 'отгружен';
  if (value.includes('process')) return 'в обработке';
  if (value.includes('new')) return 'новый';
  return value.replace(/[_-]+/g, ' ');
};

const formatAdminTitle = (type) => {
  if (type === 'created') return 'Новый заказ';
  if (type === 'paid') return 'Оплата подтверждена';
  if (type === 'canceled') return 'Заказ отменен';
  if (type === 'delivery') return 'Статус доставки обновлен';
  if (type === 'status') return 'Статус заказа обновлен';
  return 'Обновление заказа';
};

let cachedAdminChatIds = [];
let cachedAdminChatAt = 0;
let cachedUsernameMap = new Map();
let cachedUsernameAt = 0;

const parseChatIds = (value) => {
  if (!value) return [];
  if (Array.isArray(value)) {
    return value.map(item => String(item || '').trim()).filter(Boolean);
  }
  return String(value)
    .split(',')
    .map(item => item.trim())
    .filter(Boolean);
};

const isNumericId = (value) => /^\d+$/.test(String(value || '').trim());
const normalizeUsername = (value) => String(value || '').trim().replace(/^@/, '').toLowerCase();

const refreshUsernameMap = async () => {
  const now = Date.now();
  if (cachedUsernameAt && now - cachedUsernameAt < 30000) {
    return cachedUsernameMap;
  }
  cachedUsernameAt = now;
  const token = getToken();
  if (!token) return cachedUsernameMap;

  try {
    const response = await axios.get(buildApiUrl('getUpdates'), { params: { limit: 100, timeout: 0 } });
    const updates = Array.isArray(response.data?.result) ? response.data.result : [];
    const map = new Map();
    for (const update of updates) {
      const payload =
        update?.message ||
        update?.edited_message ||
        update?.my_chat_member ||
        update?.chat_member ||
        update?.channel_post;
      const from = payload?.from || null;
      const chat = payload?.chat || null;
      const username = normalizeUsername(from?.username || chat?.username || '');
      const chatId = chat?.id || from?.id;
      if (username && chatId) {
        map.set(username, String(chatId));
      }
    }
    if (map.size) {
      cachedUsernameMap = map;
    }
  } catch (err) {
    // keep old cache
  }
  return cachedUsernameMap;
};

const getAdminChatIds = async () => {
  const now = Date.now();
  if (cachedAdminChatAt && now - cachedAdminChatAt < 30000) {
    return cachedAdminChatIds.length
      ? cachedAdminChatIds
      : parseChatIds(process.env.TELEGRAM_ADMIN_CHAT_ID);
  }
  cachedAdminChatAt = now;
  try {
    const settings = await Settings.findOne({ key: 'main' }).lean();
    const list = [
      ...(settings?.telegramAdminChatIds || []),
      settings?.telegramAdminChatId
    ];
    cachedAdminChatIds = parseChatIds(list);
  } catch (err) {
    cachedAdminChatIds = [];
  }
  if (!cachedAdminChatIds.length) {
    cachedAdminChatIds = parseChatIds(process.env.TELEGRAM_ADMIN_CHAT_ID);
  }

  const numericIds = [];
  const usernames = [];
  cachedAdminChatIds.forEach(item => {
    if (isNumericId(item)) {
      numericIds.push(String(item));
    } else if (item) {
      usernames.push(item);
    }
  });

  if (!usernames.length) {
    return numericIds;
  }

  const map = await refreshUsernameMap();
  usernames.forEach(item => {
    const key = normalizeUsername(item);
    const resolved = map.get(key);
    if (resolved) {
      numericIds.push(resolved);
    }
  });

  return Array.from(new Set(numericIds));
};

const notifyOrder = async (order, type, extra = {}) => {
  if (!order) return;

  const adminChatIds = await getAdminChatIds();
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
  if (type === 'status') statusLine = `Статус: ${formatOrderStatus(extra.status || order.status)}`;

  const lines = [
    ...baseLines,
    statusLine
  ];

  const itemsBlock = formatOrderLines(order);
  if (itemsBlock) {
    lines.push('', itemsBlock);
  }

  if (extra.trackingNumber) {
    lines.push('', `Трек-номер: ${extra.trackingNumber}`);
  }

  if (extra.paymentId) {
    lines.push(`ЮKassa платеж: ${extra.paymentId}`);
  }

  if (extra.receiptUrl) {
    lines.push(`Чек: ${extra.receiptUrl}`);
  }

  const message = lines.join('\n');

  await sendMessage(customerChatId, message);
  if (adminChatIds && adminChatIds.length) {
    const adminLines = [
      `<b>grått</b>`,
      formatAdminTitle(type),
      `Заказ #${order._id?.toString().slice(-6)}`,
      `Сумма: ${formatMoney(order.totalAmount)} ₽`
    ];
    if (order.phone) adminLines.push(`Телефон: ${order.phone}`);
    if (order.email) adminLines.push(`Email: ${order.email}`);
    adminLines.push(statusLine);

    if (itemsBlock) {
      adminLines.push('', itemsBlock);
    }
    if (extra.trackingNumber) {
      adminLines.push('', `Трек-номер: ${extra.trackingNumber}`);
    }
    await Promise.all(
      adminChatIds.map(id => sendMessage(id, adminLines.join('\n')))
    );
  }
};

module.exports = {
  notifyOrder
};
