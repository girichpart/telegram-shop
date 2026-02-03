require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();

app.use(cors());
app.use(express.json());
app.use('/api/products', require('./src/routes/products'));
app.use('/api/payments', require('./src/routes/payments'));
app.use('/api/delivery', require('./src/routes/delivery'));
app.use('/api/track', require('./src/routes/track'));

mongoose.connect(process.env.MONGO_URI).then(async () => {
  console.log('MongoDB connected');
  // Dummy данные
  const Product = require('./src/models/Product');
  const count = await Product.countDocuments();
  if (count === 0) {
    await Product.insertMany([
      { name: 'Куртка', price: 5000, images: ['https://via.placeholder.com/300?text=Куртка'], description: 'Теплая куртка', stock: 5 },
      { name: 'Шапка', price: 1500, images: ['https://via.placeholder.com/300?text=Шапка'], description: 'Шапка', stock: 10 }
    ]);
    console.log('Dummy товары добавлены');
  }
}).catch(err => console.log(err));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));