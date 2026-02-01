const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
  userId: String,
  phone: String,
  email: { type: String, required: true },  // Новое поле для email
  products: [{
    productId: mongoose.Schema.Types.ObjectId,
    quantity: Number
  }],
  totalAmount: Number,
  delivery: {
    type: String,
    address: String,
    cost: Number
  },
  paymentStatus: { type: String, default: 'pending' },
  status: { type: String, default: 'new' },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Order', orderSchema);