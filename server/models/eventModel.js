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
  imageURL: {
    type: String,
  },
  startAt: {
    type: Date,
    // not required so old events don't break; you can make it required later
  },
  postedAt: {
    type: Date,
    default: Date.now,
    required: true,
  },
});

eventSchema.plugin(mongoosePaginate);

module.exports = mongoose.models.Event || mongoose.model("Event", eventSchema);
