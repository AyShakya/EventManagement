const mongoose = require('mongoose');

const refreshTokenSchema = new mongoose.Schema({
  tokenHash: { type: String, required: true },
  createdAt: { type: Number, default: Date.now },
  expiresAt: { type: Number, required: true },
  ip: { type: String },
  userAgent: { type: String },
});

const userSchema = new mongoose.Schema({
    userName: {type: String, required: true},
    email: {type: String, required: true, unique: true},
    password: {type: String, required: true, select: false},
    resetOTP: {type: String, default:""},
    resetOTPExpireAt: {type:Number, default: 0},
    userType: {type: String, default: 'user'},
    likedEvents: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: "Event", 
    }],
    refreshTokens: [refreshTokenSchema], 
    // verifyOTP: {type: String, default: ""},
    // OTPExpireAt: {type: Number, default: 0},
    // isVerified: {type: Boolean, default: false},
},
{timestamps: true});

const organiserSchema = mongoose.Schema({
  organiserName: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true, select: false },
  resetOTP: { type: String, default: "" },
  resetOTPExpireAt: { type: Number, default: 0 },
  eventsCreated: [{ type: mongoose.Schema.Types.ObjectId, ref: "Event" }],
  refreshTokens: [refreshTokenSchema],
  userType: {type: String, default: 'organiser'},
  // isVerified: {type: Boolean, default: false},
},
{timestamps: true});

module.exports = {
  User: mongoose.models.User || mongoose.model('User', userSchema),
  Organiser: mongoose.models.Organiser || mongoose.model('Organiser', organiserSchema),
};

