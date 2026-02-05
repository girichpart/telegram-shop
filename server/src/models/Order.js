const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
  userId: String,
  telegram: {
    id: String,
    username: String,
    firstName: String,
    lastName: String
  },
  phone: { type: String, required: true },
  email: { type: String, required: true },
  products: [{
    productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
    name: String,
    price: Number,
    quantity: { type: Number, default: 1 },
    size: String
  }],
  totalAmount: { type: Number, required: true },
  paymentStatus: { type: String, default: 'pending' },
  status: { type: String, default: 'new' },
  payment: {
    provider: { type: String, default: 'yookassa' },
    status: { type: String, default: 'pending' },
    yookassaPaymentId: String,
    confirmationUrl: String,
    lastEvent: String,
    updatedAt: Date
  },
  delivery: {
    provider: { type: String, default: 'cdek' },
    type: { type: String, default: 'pvz' },
    address: String,
    city: String,
    pvz: String,
    cost: { type: Number, default: 0 },
    status: { type: String, default: 'created' },
    trackingNumber: String,
    cdekOrderUuid: String,
    updatedAt: Date,
    history: [{
      status: String,
      date: Date,
      description: String,
      raw: Object
    }]
  }
}, { timestamps: true });

module.exports = mongoose.model('Order', orderSchema);
