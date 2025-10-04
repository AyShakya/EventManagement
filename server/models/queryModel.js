const mongoose = require('mongoose');

const querySchema = new mongoose.Schema({
  senderId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: false },
  senderName: { type: String, required: false },
  senderEmail: { type: String, required: false },
  eventId: { type: mongoose.Schema.Types.ObjectId, ref: 'Event', required: false },
  organizerId: { type: mongoose.Schema.Types.ObjectId, ref: 'Organizer', required: false },
  subject: { type: String, required: true },
  message: { type: String, required: true },
  sentAt: { type: Date, default: Date.now },
  status: { type: String, enum: ['pending', 'resolved'], default: 'pending' },
}, { timestamps: true });

module.exports = mongoose.models.Query || mongoose.model('Query', querySchema);