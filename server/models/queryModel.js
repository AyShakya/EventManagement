const mongoose = require('mongoose');

const querySchema = new mongoose.Schema({
  senderId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  subject: { type: String },
  message: { type: String },
  sentAt: { type: Date, default: Date.now },
  status: { type: String, enum: ['pending', 'resolved'], default: 'pending' },
}, { timestamps: true });

module.exports = mongoose.models.Query || mongoose.model('Query', querySchema);