const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: String,
  price: { type: Number, required: true },
  images: [String],
  category: String,
  stock: { type: Number, default: 10 },
  sizes: [{
    label: String,
    stock: { type: Number, default: 0 }
  }],
  techSpecs: [{
    label: String,
    value: String
  }]
});

module.exports = mongoose.model('Product', productSchema);
