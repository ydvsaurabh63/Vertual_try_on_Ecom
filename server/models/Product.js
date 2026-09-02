const mongoose = require('mongoose');

const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Product name is required'],
      trim: true,
    },
    slug: {
      type: String,
      required: [true, 'Product slug is required'],
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    category: {
      type: String,
      required: [true, 'Category is required'],
      index: true,
    },
    price: {
      type: Number,
      required: [true, 'Price is required'],
      min: 0,
    },
    discount: {
      type: Number,
      default: 0,
      min: 0,
    },
    finalPrice: {
      type: Number,
      default: 0,
      min: 0,
    },
    stock: {
      type: Number,
      default: 0,
      min: 0,
    },
    status: {
      type: String,
      enum: ['active', 'draft', 'archived'],
      default: 'active',
      index: true,
    },
    brand: {
      type: String,
      default: 'AURA Atelier',
      trim: true,
    },
    gender: {
      type: String,
      enum: ['men', 'women', 'unisex'],
      default: 'unisex',
      index: true,
    },
    description: {
      type: String,
      default: '',
    },
    images: {
      type: [String],
      default: [],
    },
    sizes: {
      type: [String],
      default: ['S', 'M', 'L', 'XL'],
    },
    colors: {
      type: [String],
      default: [],
    },
    featured: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
      transform: (doc, ret) => {
        ret.id = ret._id.toString();
        return ret;
      },
    },
    toObject: {
      virtuals: true,
      transform: (doc, ret) => {
        ret.id = ret._id.toString();
        return ret;
      },
    },
  }
);

// Pre-save hook to calculate finalPrice cleanly without negative values
productSchema.pre('save', function () {
  const price = Number(this.price) || 0;
  const discount = Number(this.discount) || 0;

  if (this.finalPrice !== undefined && this.finalPrice !== null && !isNaN(this.finalPrice) && Number(this.finalPrice) >= 0) {
    this.finalPrice = Math.max(0, Number(this.finalPrice));
  } else if (discount > 0) {
    if (discount <= 100) {
      this.finalPrice = Math.max(0, Math.round(price * (1 - discount / 100)));
    } else {
      this.finalPrice = Math.max(0, Math.round(price - discount));
    }
  } else {
    this.finalPrice = Math.max(0, price);
  }
});

module.exports = mongoose.model('Product', productSchema);
