const mongoose = require('mongoose');

const querySchema = mongoose.Schema({
    senderId: {
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'User',
    },
    subject: {
        type: String, 
    },
    message: {
        type: String,
    },
    sentAt: {
        type: Date,
        default: Date.now(),
    },
    status: {
        type: String, 
        enum: ['pending','resolved']
    }
})

module.exports = mongoose.Schema('Query', querySchema);