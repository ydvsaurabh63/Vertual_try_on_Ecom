const mongoose = require('mongoose');

const orderItemSchema = new mongoose.Schema({
  id: String,
  name: { type: String, required: true },
  price: { type: Number, required: true },
  quantity: { type: Number, required: true, min: 1 },
  image: String,
  size: String,
  color: String,
});

const timelineItemSchema = new mongoose.Schema({
  status: { type: String, required: true },
  timestamp: { type: Date, default: Date.now },
  detail: { type: String, default: '' },
});

const orderSchema = new mongoose.Schema(
  {
    orderNumber: {
      type: String,
      unique: true,
      index: true,
    },
    userId: {
      type: String,
      default: '',
    },
    customer: {
      name: { type: String, required: true },
      email: { type: String, required: true },
      phone: { type: String, default: '' },
      address: { type: String, default: '' },
    },
    items: [orderItemSchema],
    subtotal: {
      type: Number,
      required: true,
    },
    tax: {
      type: Number,
      default: 0,
    },
    shipping: {
      type: Number,
      default: 0,
    },
    total: {
      type: Number,
      required: true,
    },
    paymentStatus: {
      type: String,
      enum: ['paid', 'pending', 'failed', 'refunded'],
      default: 'paid',
    },
    paymentMethod: {
      type: String,
      default: 'Credit Card (Stripe)',
    },
    status: {
      type: String,
      enum: ['Pending', 'Processing', 'Shipped', 'Delivered', 'Cancelled'],
      default: 'Pending',
      index: true,
    },
    trackingNumber: {
      type: String,
      default: '',
    },
    notes: {
      type: String,
      default: '',
    },
    timeline: [timelineItemSchema],
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
      transform: (doc, ret) => {
        ret.id = ret.orderNumber || ret._id.toString();
        return ret;
      },
    },
    toObject: {
      virtuals: true,
      transform: (doc, ret) => {
        ret.id = ret.orderNumber || ret._id.toString();
        return ret;
      },
    },
  }
);

// Auto-generate orderNumber before save if not provided
orderSchema.pre('save', function () {
  if (!this.orderNumber) {
    this.orderNumber = 'ORD-' + Math.floor(10000 + Math.random() * 90000);
  }
  if (!this.timeline || this.timeline.length === 0) {
    this.timeline = [
      {
        status: 'Order Placed',
        timestamp: new Date(),
        detail: 'Order created successfully.',
      },
    ];
  }
});

module.exports = mongoose.model('Order', orderSchema);
