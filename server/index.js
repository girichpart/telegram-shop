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

mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.log(err));

// Роуты подключим позже

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));