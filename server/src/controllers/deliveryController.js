const axios = require('axios');
const Order = require('../models/Order');
const { notifyOrder } = require('../utils/telegramNotify');

const isCdekEnabled = () => process.env.CDEK_ENABLED === 'true';
const isYandexEnabled = () => process.env.YANDEX_ENABLED === 'true';

let cachedToken = null;
let cachedTokenExpiresAt = 0;
const cdekCityCache = new Map();

const normalizeCityName = (value) => {
  if (!value) return '';
  return String(value).trim();
};

const resolveCdekCityCode = async (city) => {
  const normalized = normalizeCityName(city);
  if (!normalized || !process.env.CDEK_CITIES_URL) return null;

  const aliasMap = new Map([
    ['спб', 'Санкт-Петербург'],
    ['санкт-петербург', 'Санкт-Петербург'],
    ['питер', 'Санкт-Петербург'],
    ['мск', 'Москва'],
    ['москва', 'Москва']
  ]);

  const key = normalized.toLowerCase();
  const lookupValue = aliasMap.get(key) || normalized;
  const cacheKey = lookupValue.toLowerCase();
  if (cdekCityCache.has(cacheKey)) return cdekCityCache.get(cacheKey);

  try {
    const token = await getCdekToken();
    const response = await axios.get(process.env.CDEK_CITIES_URL, {
      headers: {
        'Authorization': `Bearer ${token}`
      },
      params: {
        city: lookupValue,
        size: 1,
        country_codes: 'RU'
      }
    });

    const payload = response.data || [];
    const list = Array.isArray(payload)
      ? payload
      : payload.cities || payload.items || payload.data || [];
    const item = Array.isArray(list) ? list[0] : null;
    const code = item?.code || item?.city_code || item?.location_code || null;
    cdekCityCache.set(cacheKey, code);
    return code;
  } catch (err) {
    return null;
  }
};

const buildYandexHeaders = () => {
  const headers = { 'Content-Type': 'application/json' };
  if (process.env.YANDEX_OAUTH_TOKEN) {
    headers.Authorization = `OAuth ${process.env.YANDEX_OAUTH_TOKEN}`;
  } else if (process.env.YANDEX_API_KEY) {
    headers.Authorization = `Api-Key ${process.env.YANDEX_API_KEY}`;
  } else if (process.env.YANDEX_TOKEN) {
    headers.Authorization = `Bearer ${process.env.YANDEX_TOKEN}`;
  }
  if (process.env.YANDEX_CLIENT_ID) {
    headers['X-Client-ID'] = process.env.YANDEX_CLIENT_ID;
  }
  return headers;
};

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
  const { city, type, provider } = req.body || {};
  const normalizedProvider = String(provider || 'cdek').toLowerCase();

  if (normalizedProvider === 'yandex') {
    if (!isYandexEnabled()) {
      return res.json({
        provider: 'YANDEX_MOCK',
        city: city || 'Не указан',
        type: type || 'pvz',
        cost: 490,
        etaDays: 2
      });
    }

    try {
      if (!process.env.YANDEX_CALC_URL) {
        throw new Error('YANDEX_CALC_URL not set');
      }

      const payloadBody = { ...(req.body || {}) };
      delete payloadBody.provider;

      const response = await axios.post(
        process.env.YANDEX_CALC_URL,
        payloadBody,
        { headers: buildYandexHeaders() }
      );

      const payload = response.data || {};
      const directCost = payload.cost || payload.price || payload.total_sum || payload.delivery_sum || payload.deliveryPrice;
      const etaDays = payload.etaDays || payload.eta || payload.period_min || payload.delivery_period_min || null;

      return res.json({
        provider: 'YANDEX',
        raw: payload,
        cost: typeof directCost === 'number' ? directCost : 0,
        etaDays: etaDays || null
      });
    } catch (err) {
      return res.status(500).json({ error: err.response?.data || err.message });
    }
  }

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
    const requestedCode = Number(req.body.toCityCode || req.body.cityCode || 0) || null;
    const resolvedCode = requestedCode || await resolveCdekCityCode(city);
    const toLocation = resolvedCode
      ? { code: Number(resolvedCode) }
      : city
        ? { city }
        : {};

    const response = await axios.post(
      process.env.CDEK_CALC_URL,
      {
        from_location: { code: Number(process.env.CDEK_FROM_CITY_CODE || 137) },
        to_location: toLocation,
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
  const normalizedProvider = String(req.query.provider || 'cdek').toLowerCase();

  if (normalizedProvider === 'yandex') {
    if (!isYandexEnabled()) {
      return res.json([
        {
          id: 'YANDEX-PVZ-001',
          city: req.query.city || 'Санкт-Петербург',
          address: 'Литейный пр., 12',
          workTime: '10:00-20:00'
        },
        {
          id: 'YANDEX-PVZ-002',
          city: req.query.city || 'Санкт-Петербург',
          address: 'Гороховая, 18',
          workTime: '09:00-21:00'
        }
      ]);
    }

    try {
      if (!process.env.YANDEX_PVZ_URL) {
        throw new Error('YANDEX_PVZ_URL not set');
      }

      const params = { ...req.query };
      delete params.provider;
      const response = await axios.get(process.env.YANDEX_PVZ_URL, {
        headers: buildYandexHeaders(),
        params
      });

      const payload = response.data || [];
      const list = Array.isArray(payload)
        ? payload
        : payload.items || payload.points || payload.pickupPoints || payload.data || [];
      return res.json(list);
    } catch (err) {
      return res.status(500).json({ error: err.response?.data || err.message });
    }
  }

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
    const params = { ...req.query };
    delete params.provider;
    if (!params.type) params.type = 'PVZ';
    const rawCity = params.city || params.cityName;
    const directCode = Number(params.city_code || params.cityCode || 0) || null;
    const resolvedCode = directCode || await resolveCdekCityCode(rawCity);
    if (resolvedCode) {
      params.city_code = resolvedCode;
      delete params.city;
      delete params.cityName;
      delete params.cityCode;
    }

    const response = await axios.get(process.env.CDEK_PVZ_URL, {
      headers: {
        'Authorization': `Bearer ${token}`
      },
      params
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

exports.getCities = async (req, res) => {
  const query = (req.query.q || req.query.city || '').toString().trim();
  if (!query) {
    return res.json([]);
  }

  if (!isCdekEnabled()) {
    return res.json([
      { code: 137, city: 'Санкт-Петербург', region: 'Санкт-Петербург', country: 'Россия' },
      { code: 44, city: 'Москва', region: 'Москва', country: 'Россия' }
    ].filter(item => item.city.toLowerCase().includes(query.toLowerCase())));
  }

  try {
    if (!process.env.CDEK_CITIES_URL) {
      throw new Error('CDEK_CITIES_URL not set');
    }

    const token = await getCdekToken();
    const response = await axios.get(process.env.CDEK_CITIES_URL, {
      headers: {
        'Authorization': `Bearer ${token}`
      },
      params: {
        city: query,
        size: 7,
        country_codes: 'RU'
      }
    });

    const payload = response.data || [];
    const list = Array.isArray(payload)
      ? payload
      : payload.cities || payload.items || payload.data || [];
    const mapped = (Array.isArray(list) ? list : []).map(item => ({
      code: item.code || item.city_code || item.location_code,
      city: item.city || item.city_name || item.name || '',
      region: item.region || item.region_name || '',
      country: item.country || item.country_name || ''
    }));

    res.json(mapped.filter(item => item.city));
  } catch (err) {
    res.status(500).json({ error: err.response?.data || err.message });
  }
};

exports.status = async (req, res) => {
  const enabled = isCdekEnabled();
  res.json({
    enabled,
    hasAuth: Boolean(process.env.CDEK_AUTH_URL && (process.env.CDEK_CLIENT_ID || process.env.CDEK_ACCOUNT) && (process.env.CDEK_CLIENT_SECRET || process.env.CDEK_PASSWORD)),
    hasCalc: Boolean(process.env.CDEK_CALC_URL),
    hasPvz: Boolean(process.env.CDEK_PVZ_URL),
    fromCityCode: process.env.CDEK_FROM_CITY_CODE || null,
    yandex: {
      enabled: isYandexEnabled(),
      hasCalc: Boolean(process.env.YANDEX_CALC_URL),
      hasPvz: Boolean(process.env.YANDEX_PVZ_URL)
    }
  });
};
