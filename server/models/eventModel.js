const mongoose = require("mongoose");
const mongoosePaginate = require("mongoose-paginate-v2");

const eventSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  location: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  organizer: { type: mongoose.Schema.Types.ObjectId, ref: "Organizer" },
  views: { type: Number, default: 0 },
  likes: { type: Number, default: 0 },
  images: [{ type: String }],
  imagePublicId: { type: String },
  attendees: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
  startAt: { type: Date },
  postedAt: { type: Date, default: Date.now, required: true },
  registrationFormURL: { type: String },
  stats: {
    filled: { type: Boolean, default: false }, 
    filledAt: { type: Date },

    totalAttendees: { type: Number, min: 0 },
    expectedAttendees: { type: Number, min: 0 },

    averageRating: { type: Number, min: 0, max: 5 }, 

    revenue: { type: Number, min: 0 }, 
    cost: { type: Number, min: 0 },    

    highlights: { type: String }, 
    notes: { type: String },      
    isPublished: { type: Boolean, default: false }, 
  },
});

eventSchema.plugin(mongoosePaginate);

module.exports = mongoose.models.Event || mongoose.model("Event", eventSchema);
