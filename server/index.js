require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const http = require('http');
const https = require('https');

const app = express();
app.set('trust proxy', 1);

const allowedOrigins = [process.env.CLIENT_ORIGIN, process.env.ADMIN_ORIGIN].filter(Boolean);
const allowAllOrigins = process.env.CORS_ALLOW_ALL === 'true';
app.use(cors({
  origin: (origin, callback) => {
    if (allowAllOrigins) {
      return callback(null, true);
    }
    if (!origin) {
      return callback(null, true);
    }
    if (!allowedOrigins.length) {
      return callback(null, true);
    }
    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    }
    return callback(null, false);
  }
}));
app.use('/api', express.json({ limit: '2mb' }));
app.use('/api', express.urlencoded({ extended: true }));

const uploadsDir = path.join(__dirname, 'uploads');
fs.mkdirSync(uploadsDir, { recursive: true });
app.use('/uploads', express.static(uploadsDir));
const clientPublicPath = path.join(__dirname, '..', 'client', 'public');
app.use(express.static(clientPublicPath));

app.use('/api/admin', require('./src/routes/admin'));
app.use('/api/uploads', require('./src/routes/uploads'));
app.use('/api/products', require('./src/routes/products'));
app.use('/api/orders', require('./src/routes/orders'));
app.use('/api/payments', require('./src/routes/payments'));
app.use('/api/delivery', require('./src/routes/delivery'));
app.use('/api/track', require('./src/routes/track'));
app.use('/api/settings', require('./src/routes/settings'));
app.use('/api/customers', require('./src/routes/customers'));

const devProxyEnabled = process.env.DEV_PROXY === 'true';
const clientDevUrl = process.env.CLIENT_DEV_URL || 'http://localhost:5173';
const adminDevUrl = process.env.ADMIN_DEV_URL || 'http://localhost:5174';
const clientDistPath = path.join(__dirname, '..', 'client', 'dist');
const adminDistPath = path.join(__dirname, '..', 'admin', 'dist');
const clientIndex = path.join(clientDistPath, 'index.html');
const adminIndex = path.join(adminDistPath, 'index.html');

const proxyRequest = (target, req, res, stripPrefix = '') => {
  try {
    const targetUrl = new URL(target);
    const client = targetUrl.protocol === 'https:' ? https : http;
    const safePrefix = stripPrefix
      ? stripPrefix.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
      : '';
    const pathToProxy = safePrefix
      ? req.originalUrl.replace(new RegExp(`^${safePrefix}`), '') || '/'
      : req.originalUrl || '/';
    const url = new URL(pathToProxy, target);

    const proxyReq = client.request({
      protocol: url.protocol,
      hostname: url.hostname,
      port: url.port || (url.protocol === 'https:' ? 443 : 80),
      method: req.method,
      path: `${url.pathname}${url.search}`,
      headers: {
        ...req.headers,
        host: url.host
      }
    }, (proxyRes) => {
      res.writeHead(proxyRes.statusCode || 502, proxyRes.headers);
      proxyRes.pipe(res, { end: true });
    });

    proxyReq.on('error', () => {
      res.statusCode = 502;
      res.end('Proxy error');
    });

    if (req.readable) {
      req.pipe(proxyReq, { end: true });
    } else {
      proxyReq.end();
    }
  } catch {
    res.statusCode = 502;
    res.end('Proxy error');
  }
};

if (devProxyEnabled) {
  app.use('/admin', (req, res) => proxyRequest(adminDevUrl, req, res, '/admin'));
  app.use('/', (req, res) => proxyRequest(clientDevUrl, req, res));
} else {
  if (fs.existsSync(adminIndex)) {
    app.use('/admin', express.static(adminDistPath));
    app.get('/admin/*', (req, res) => res.sendFile(adminIndex));
  }

  if (fs.existsSync(clientIndex)) {
    app.use(express.static(clientDistPath));
    app.get('*', (req, res) => res.sendFile(clientIndex));
  }
}

mongoose.connect(process.env.MONGO_URI).then(async () => {
  console.log('MongoDB connected');
  const Product = require('./src/models/Product');
  const count = await Product.countDocuments();
  if (count === 0) {
    await Product.insertMany([
      {
        name: 'MARK LONG SLEEVE',
        price: 8500,
        images: ['https://lh3.googleusercontent.com/aida-public/AB6AXuA79l-zUTjdlXIvI4ztSbTyH5PaeJ9b6zFZcUDBxaBsrndxHhU3PIQCU_vRfAWAGk8-uDA7Hefxz3ZQDn1UsA8tjrmvZNd4I2NQHuyPSxY7i2HHbG2hB0Qq56t4XZqgeDhtZMUKXeVfjgEWXZRZAFK1VSTB3DQACVbhucCJLvXfyqQy1vl3PXhF9p_h3Gqv-iQj3E3Luo_VUbHgcbNefvv4bMFEXQ661J3kXZ8n_GPd7zYP7wzkghq_ekOOzbDN9NfcejE4TA-6PiQ'],
        description: 'Garment as a Mark / Off-White',
        category: 'Essential Layer / SS24',
        stock: 8
      },
      {
        name: 'NYLON CARGO PANT',
        price: 14500,
        images: ['https://lh3.googleusercontent.com/aida-public/AB6AXuAiOFmxZ1Vr4O5nNiqL88oqSI8TnNsJr7rNo3HfdeEgWxTjSIIz6Xm1U-E7drjnRsH6wEE2mWpv7ImXgTKcBCzOe9uLbyPyb2VJCOoBUYfqYhTb1eF0bPHjqq3_cTAKkzzi5R4SFkgKZLezuq4O5d4U7IIfJRB1X3JEBkxJLJXX-ooVcmnsvSjbrd8Lupx28vVEsJxzFDPfhYK-_RHEE_PyMxtnCEvJpYlvtfror_3V9iEpUhxjiFHn4_bA0ZCCOguVzz3mjTQdhHs'],
        description: 'Technical / Slate Black',
        category: 'Bottoms / Tech',
        stock: 6
      },
      {
        name: 'TERRAIN RUNNER 01',
        price: 21000,
        images: ['https://lh3.googleusercontent.com/aida-public/AB6AXuCBTePYo5QAchbqKnMaFdzVK3oP3MpnUTiMao4nPlVPs05X30ydX5n2UHQ1kGLrDygUwZRNr42jRbymiUxZgtWa7CNXsBN2bLI9q5i9H6Enc4NIQhtQ3k-YD87xsIyiH2IEzcabSUFr96r1nBqy_bD_6pbDVMVVQqMMrcsX7gfolKoW-WbAvX0W2uYYkivsp7gbi-jD09h85VwghEP0GDjkd0lsVad5zP87nxpCqKBNoN9TX_rb79gZKccHdsgDoPGYYZRbzFlDUxc'],
        description: 'Performance / Moss Green',
        category: 'Footwear / Tech',
        stock: 4
      },
      {
        name: 'TECHNICAL GLOVE',
        price: 5500,
        images: ['https://lh3.googleusercontent.com/aida-public/AB6AXuBUH7bwHY5tfljXDj77Uwxfs9k_JFgmkX8h1TmTL0sUegKPzS9m-pQBw6wQm2xcfSjuRxZdbYNUUY2YZTP35WkCHcYDPbvaAxHzk2L2aeJnDH55fq4MWxRCvxtbsD6b3cuo42uIEHQQHsJd5jUkGNQ-HBh95Jq2kKNBaZutf_cDIkElGNqljEWZ-E3KHAN8T_4KwOcWcfqSp4nFNyFSjz9sJe3uSytJGmeeFN3MUS1zGalcp7m89IBxwFQZvJWM8pocM65ZjHT5iW8'],
        description: 'Accessory / Grip Tech',
        category: 'Accessory / Tech',
        stock: 12
      }
    ]);
    console.log('Seed товары добавлены');
  }
}).catch(err => console.log(err));

const PORT = process.env.PORT || 3000;
const httpsKeyPath = process.env.HTTPS_KEY_PATH;
const httpsCertPath = process.env.HTTPS_CERT_PATH;
const httpsPort = process.env.HTTPS_PORT || PORT;

if (httpsKeyPath && httpsCertPath && fs.existsSync(httpsKeyPath) && fs.existsSync(httpsCertPath)) {
  const httpsServer = https.createServer({
    key: fs.readFileSync(httpsKeyPath),
    cert: fs.readFileSync(httpsCertPath)
  }, app);

  httpsServer.listen(httpsPort, () => {
    console.log(`HTTPS server running on port ${httpsPort}`);
  });
} else {
  app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
}
