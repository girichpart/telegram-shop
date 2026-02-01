const axios = require('axios');

exports.calculateDelivery = async (req, res) => {
  const { toCityCode, packages } = req.body;  // toCityCode - код города СДЭК, packages - массив {weight, length, width, height}

  try {
    const response = await axios.post('https://api.cdek.ru/v2/calculator/tariff', {
      from_location: { code: 137 },  // Санкт-Петербург (код 137 для СДЭК, проверьте в их API)
      to_location: { code: toCityCode },
      packages: packages || [{ weight: 1000 }]  // Пример: 1 кг
    }, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Basic ${Buffer.from(`${process.env.CDEK_ACCOUNT}:${process.env.CDEK_PASSWORD}`).toString('base64')}`
      }
    });

    res.json(response.data);
  } catch (err) {
    res.status(500).json({ error: err.response ? err.response.data : err.message });
  }
};

exports.getPvzList = async (req, res) => {
  const { cityCode } = req.query;

  try {
    const response = await axios.get(`https://api.cdek.ru/v2/deliverypoints?city_code=${cityCode}`, {
      headers: {
        'Authorization': `Basic ${Buffer.from(`${process.env.CDEK_ACCOUNT}:${process.env.CDEK_PASSWORD}`).toString('base64')}`
      }
    });

    res.json(response.data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};