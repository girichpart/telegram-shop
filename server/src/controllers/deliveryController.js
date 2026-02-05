const axios = require('axios');
const Order = require('../models/Order');
const { notifyOrder } = require('../utils/telegramNotify');

const isCdekEnabled = () => process.env.CDEK_ENABLED === 'true';

let cachedToken = null;
let cachedTokenExpiresAt = 0;

const getCdekToken = async () => {
  const clientId = process.env.CDEK_CLIENT_ID || process.env.CDEK_ACCOUNT;
  const clientSecret = process.env.CDEK_CLIENT_SECRET || process.env.CDEK_PASSWORD;

  if (!process.env.CDEK_AUTH_URL || !clientId || !clientSecret) {
    throw new Error('CDEK auth env not set');
  }

  const now = Date.now();
  if (cachedToken && cachedTokenExpiresAt > now) {
    return cachedToken;
  }

  const payload = new URLSearchParams({
    grant_type: 'client_credentials',
    client_id: clientId,
    client_secret: clientSecret
  });

  const res = await axios.post(process.env.CDEK_AUTH_URL, payload.toString(), {
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
  });

  cachedToken = res.data.access_token;
  cachedTokenExpiresAt = now + (res.data.expires_in || 3600) * 1000 - 30000;
  return cachedToken;
};

exports.calculateDelivery = async (req, res) => {
  const { city, type } = req.body;

  if (!isCdekEnabled()) {
    return res.json({
      provider: 'CDEK_MOCK',
      city: city || 'Не указан',
      type: type || 'pvz',
      cost: 390,
      etaDays: 3
    });
  }

  try {
    if (!process.env.CDEK_CALC_URL) {
      throw new Error('CDEK_CALC_URL not set');
    }

    const token = await getCdekToken();

    const response = await axios.post(
      process.env.CDEK_CALC_URL,
      {
        from_location: { code: Number(process.env.CDEK_FROM_CITY_CODE || 137) },
        to_location: { code: Number(req.body.toCityCode || req.body.cityCode || 0) || undefined },
        packages: req.body.packages || [{ weight: 1000 }]
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      }
    );

    const payload = response.data || {};
    const directCost = payload.cost || payload.price || payload.total_sum || payload.delivery_sum;
    const etaDays = payload.period_min || payload.delivery_period_min || payload.delivery_term_min || null;
    const etaDaysMax = payload.period_max || payload.delivery_period_max || payload.delivery_term_max || null;
    const resolvedEta = etaDaysMax || etaDays;

    res.json({
      provider: 'CDEK',
      raw: payload,
      cost: typeof directCost === 'number' ? directCost : 0,
      etaDays: resolvedEta
    });
  } catch (err) {
    res.status(500).json({ error: err.response?.data || err.message });
  }
};

exports.getPvzList = async (req, res) => {
  if (!isCdekEnabled()) {
    return res.json([
      {
        id: 'PVZ-001',
        city: req.query.city || 'Санкт-Петербург',
        address: 'Невский пр., 28',
        workTime: '10:00-20:00'
      },
      {
        id: 'PVZ-002',
        city: req.query.city || 'Санкт-Петербург',
        address: 'Лиговский пр., 50',
        workTime: '09:00-21:00'
      }
    ]);
  }

  try {
    if (!process.env.CDEK_PVZ_URL) {
      throw new Error('CDEK_PVZ_URL not set');
    }

    const token = await getCdekToken();
    const response = await axios.get(process.env.CDEK_PVZ_URL, {
      headers: {
        'Authorization': `Bearer ${token}`
      },
      params: req.query
    });

    res.json(response.data);
  } catch (err) {
    res.status(500).json({ error: err.response?.data || err.message });
  }
};

exports.webhook = async (req, res) => {
  const secret = process.env.CDEK_WEBHOOK_SECRET;
  const incoming = req.headers['x-webhook-token'];
  if (secret && incoming !== secret) {
    return res.status(403).json({ error: 'Forbidden' });
  }

  const payload = req.body || {};
  const orderUuid = payload.order_uuid || payload.order_uuid_v2 || payload.order_uuid_v3;
  const cdekNumber = payload.cdek_number || payload.cdekNumber;
  const status = payload.status || payload.status_name || payload.state || 'updated';

  try {
    const order = await Order.findOne({
      $or: [
        { 'delivery.cdekOrderUuid': orderUuid },
        { 'delivery.trackingNumber': cdekNumber }
      ]
    });

    if (order) {
      const history = order.delivery.history || [];
      history.push({
        status,
        date: new Date(),
        description: payload.description || payload.message || '',
        raw: payload
      });

      order.delivery.status = status;
      order.delivery.trackingNumber = cdekNumber || order.delivery.trackingNumber;
      order.delivery.cdekOrderUuid = orderUuid || order.delivery.cdekOrderUuid;
      order.delivery.updatedAt = new Date();
      order.delivery.history = history;
      await order.save();
      await notifyOrder(order, 'delivery', {
        deliveryStatus: status,
        trackingNumber: order.delivery.trackingNumber
      });
    }
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }

  res.sendStatus(200);
};

exports.status = async (req, res) => {
  const enabled = isCdekEnabled();
  res.json({
    enabled,
    hasAuth: Boolean(process.env.CDEK_AUTH_URL && (process.env.CDEK_CLIENT_ID || process.env.CDEK_ACCOUNT) && (process.env.CDEK_CLIENT_SECRET || process.env.CDEK_PASSWORD)),
    hasCalc: Boolean(process.env.CDEK_CALC_URL),
    hasPvz: Boolean(process.env.CDEK_PVZ_URL),
    fromCityCode: process.env.CDEK_FROM_CITY_CODE || null
  });
};
