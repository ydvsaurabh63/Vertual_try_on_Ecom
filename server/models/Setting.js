const mongoose = require('mongoose');

const settingSchema = new mongoose.Schema(
  {
    websiteName: {
      type: String,
      default: 'AURA Atelier & Virtual Try-On Studio',
    },
    websiteLogo: {
      type: String,
      default: '/assets/images/brand-logo.png',
    },
    contactEmail: {
      type: String,
      default: 'concierge@aura-fashion.com',
    },
    contactPhone: {
      type: String,
      default: '+1 (800) 555-AURA',
    },
    currency: {
      type: String,
      default: 'USD',
    },
    currencySymbol: {
      type: String,
      default: '$',
    },
    maintenanceMode: {
      type: Boolean,
      default: false,
    },
    allowVirtualTryOn: {
      type: Boolean,
      default: true,
    },
    defaultTryOnModel: {
      type: String,
      default: 'real-man-1',
    },
    announcementText: {
      type: String,
      default: 'Complimentary Worldwide Express Shipping on Orders Over $250 • Experience Photorealistic AI Try-On',
    },
    socialLinks: {
      instagram: { type: String, default: 'https://instagram.com/aura.fashion' },
      twitter: { type: String, default: 'https://twitter.com/aura_atelier' },
      facebook: { type: String, default: 'https://facebook.com/aurafashion' },
      youtube: { type: String, default: 'https://youtube.com/@aurafashion' },
    },
    banner: {
      heading: { type: String, default: 'AUTUMN / WINTER 2026 COLLECTION' },
      subheading: { type: String, default: 'Tailored Minimalist Luxury with Photorealistic AI Try-On Fitting Room' },
      buttonText: { type: String, default: 'Explore Collection' },
      buttonLink: { type: String, default: '/shop' },
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

module.exports = mongoose.model('Setting', settingSchema);
