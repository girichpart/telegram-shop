require('dotenv').config();
const mongoose = require('mongoose');
const Product = require('../models/Product');

const samples = [
  {
    name: 'Vortex-01 System Shell',
    price: 42000,
    description: '3-layer technical shell built for volatile urban conditions.',
    category: 'Outerwear / Tech',
    images: [
      'https://images.unsplash.com/photo-1471879832106-c7ab9e0cee23?auto=format&fit=crop&w=900&q=80'
    ],
    stock: 8
  },
  {
    name: 'Terrain Shoe 01',
    price: 18000,
    description: 'Rugged low-profile outsole with waterproof upper.',
    category: 'Footwear / Vibram',
    images: [
      'https://images.unsplash.com/photo-1460353581641-37baddab0fa2?auto=format&fit=crop&w=900&q=80'
    ],
    stock: 5
  },
  {
    name: 'X-Pac Sling Bag',
    price: 13500,
    description: 'Lightweight technical sling with waterproof X-Pac fabric.',
    category: 'Carry / Waterproof',
    images: [
      'https://images.unsplash.com/photo-1512436991641-6745cdb1723f?auto=format&fit=crop&w=900&q=80'
    ],
    stock: 12
  }
];

const run = async () => {
  const sample = samples[Math.floor(Math.random() * samples.length)];
  await mongoose.connect(process.env.MONGO_URI);
  const product = await Product.create(sample);
  console.log('Seed product created:', product._id.toString());
  await mongoose.disconnect();
};

run().catch((err) => {
  console.error('Seed error', err);
  process.exit(1);
});
