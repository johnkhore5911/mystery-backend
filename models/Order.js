const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
  // orderNumber: {
  //   type: String,
  //   required: true,
  //   unique: true
  // },
  tableNumber: {
    type: String,
    required: true
  },
  customerEmail: {
    type: String,
    required: true,
    trim: true,
    lowercase: true
  },
  items: [{
    menuItem: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'MenuItem',
      required: true
    },
    name: String,
    price: Number,
    quantity: {
      type: Number,
      required: true,
      min: 1
    },
    isVeg: Boolean
  }],
  subtotal: {
    type: Number,
    required: true
  },
  gst: {
    type: Number,
    required: true
  },
  total: {
    type: Number,
    required: true
  },
  paymentId: {
    type: String,
    required: true
  },
  paymentStatus: {
    type: String,
    enum: ['pending', 'completed', 'failed'],
    default: 'pending'
  },
  orderStatus: {
    type: String,
    enum: ['pending', 'preparing', 'completed', 'cancelled'],
    default: 'pending'
  },
  receiptSent: {
    type: Boolean,
    default: false
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  completedAt: {
    type: Date
  }
});

// Generate order number
// orderSchema.pre('save', async function(next) {
//   if (!this.orderNumber) {
//     this.orderNumber = 'MYS-' + Date.now() + '-' + Math.floor(Math.random() * 1000);
//   }
//   next();
// });

module.exports = mongoose.model('Order', orderSchema);
