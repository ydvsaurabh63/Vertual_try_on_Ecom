const mongoose = require('mongoose');

const tryOnSessionSchema = new mongoose.Schema(
  {
    sessionId: {
      type: String,
      index: true,
    },
    userId: {
      type: String,
      default: '',
    },
    userName: {
      type: String,
      default: 'Guest',
    },
    userEmail: {
      type: String,
      default: '',
    },
    productName: {
      type: String,
      default: '',
    },
    clothImageUrl: {
      type: String,
      required: true,
    },
    modelImageUrl: {
      type: String,
      required: true,
    },
    modelName: {
      type: String,
      default: 'Default Model',
    },
    generatedImageUrl: {
      type: String,
      default: null,
    },
    status: {
      type: String,
      enum: ['success', 'failed'],
      default: 'success',
      index: true,
    },
    apiStatus: {
      type: String,
      default: 'COMPLETED (200 OK)',
    },
    errorMessage: {
      type: String,
      default: null,
    },
    responseTimeMs: {
      type: Number,
      default: 0,
    },
    aiProvider: {
      type: String,
      default: 'LightX AI v2',
    },
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
      transform: (doc, ret) => {
        ret.id = ret.sessionId || ret._id.toString();
        return ret;
      },
    },
    toObject: {
      virtuals: true,
      transform: (doc, ret) => {
        ret.id = ret.sessionId || ret._id.toString();
        return ret;
      },
    },
  }
);

tryOnSessionSchema.pre('save', function () {
  if (!this.sessionId) {
    this.sessionId = 'tryon-' + Date.now();
  }
});

module.exports = mongoose.model('TryOnSession', tryOnSessionSchema);
