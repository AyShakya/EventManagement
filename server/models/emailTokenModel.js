const mongoose = require('mongoose');

const emailTokenSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, refPath: 'modelType', required: true },
  modelType: { type: String, required: true, enum: ['User', 'Organizer'] },
  tokenHash: { type: String, required: true, index: true },
  type: { type: String, enum: ['verifyEmail', 'resetPassword'], default: 'verifyEmail' },
  expiresAt: { type: Date, required: true },
  createdAt: { type: Date, default: Date.now }
});

emailTokenSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });
module.exports = mongoose.model('EmailToken', emailTokenSchema);