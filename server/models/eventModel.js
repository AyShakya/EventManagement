const mongoose = require("mongoose");
const mongoosePaginate = require('mongoose-paginate-v2');

const eventSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true
    },
    location: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true,
    },
    organizer: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    views: {type: Number, default: 0},
    likes: {type: Number, default: 0},
    imageURL: {
        type: String,
    },
    postedAt: {
        type: Date,
        required: true,
    }
})

eventSchema.plugin(mongoosePaginate);

module.exports = mongoose.Schema('Event', eventSchema);