const { User } = require("../models/userModel");
const Event = require("../models/eventModel");
const { default: mongoose } = require("mongoose");
const asyncHandler = require("../utils/asyncHandler");

//Individual Event Methods
exports.getAllEvents = asyncHandler(async (req, res) => {
  const page = Math.max(1, Number(req.query.page) || 1);
  const limit = Math.min(100, Number(req.query.limit) || 8);
  const options = {
    page,
    limit,
    lean: true,
    select:
      "title location description organizer views likes imageURL postedAt",
  };

  const event = await Event.paginate({}, options);
  if (!event) {
    return res.status(200).json({ message: "No Event Found" });
  }
  return res.status(200).json({
    message: "Events Fetched",
    meta: {
      totalDocs: event.totalDocs,
      limit: event.limit,
      totalPages: event.totalPages,
      currentPage: event.page,
      pagingCounter: event.pagingCounter,
      hasPrevPage: event.hasPrevPage,
      hasNextPage: event.hasNextPage,
      prevPage: event.prevPage,
      nextPage: event.nextPage,
    },
    events: event.docs,
  });
});

exports.getEventById = asyncHandler(async (req, res) => {
  const { id } = req.params;
  if (!mongoose.isValidObjectId(id))
    return res.status(404).json({ message: "Invalid Event Id" });
  let event;

  if (req.user) {
    event = await Event.findByIdAndUpdate(
      id,
      { $inc: { viewsCount: 1 } },
      { new: true, lean: true }
    );
  } else {
    event = await Event.findById(id).lean();
  }
  if (!event) return res.status(404).json({ message: "Missing Event" });
  return res.status(200).json({ message: "Event Sent", event });
});

//User Logged In Methods-
exports.likeEvent = asyncHandler(async (req, res) => {
  const eventId = req.params.id;
  const userId = req.user?.id || req.body.userId;
  if (!eventId || !userId)
    return res.status(400).json({ message: "Missing id(s)" });
  if (!mongoose.isValidObjectId(eventId) || !mongoose.isValidObjectId(userId))
    return res.status(404).json({ message: "Missing Id" });

  const userUpdate = await User.findOneAndUpdate(
    { _id: userId, likedEvents: { $ne: eventId } },
    { $addToSet: { likedEvents: eventId } },
    { new: true }
  );
  if (!userUpdate) {
    const userExists = await User.findById(userId).lean();
    if (!userExists) return res.status(404).json({ message: "User not found" });
    return res.status(400).json({ message: "User already liked this event" });
  }

  const event = await Event.findByIdAndUpdate(
    eventId,
    { $inc: { likes: 1 } },
    { new: true, lean: true }
  ).lean();

  if (!event) {
    await User.findByIdAndUpdate(userId, { $pull: { likedEvents: eventId } });
    return res.status(404).json({ message: "Event not found" });
  }

  return res.status(200).json({ message: "Event liked", event });
});

exports.getLikedEvents = asyncHandler(async (req, res) => {
  const userId = req.user?.id || req.body.userId;
  if (!userId) return res.status(400).json({ message: "Missing Id" });
  if (!mongoose.isValidObjectId(userId))
    return res.status(400).json({ message: "Invalid Id" });

  const page = Math.max(1, Number(req.query.page) || 1);
  const limit = Math.min(100, Number(req.query.limit) || 8);

  const user = await User.findById(userId).select("likedEvents").lean();
  if (!user) return res.status(404).json({ message: "User not found" });

  const options = {
    page,
    limit,
    lean: true,
    select:
      "title location description organizer views likes imageURL postedAt",
  };

  const events = await Event.paginate(
    { _id: { $in: user.likedEvents } },
    options
  );
  return res.status(201).json({
    message: "Liked Events Fetched",
    meta: {
      totalDocs: events.totalDocs,
      limit: events.limit,
      totalPages: events.totalPages,
      currentPage: events.page,
      pagingCounter: events.pagingCounter,
      hasPrevPage: events.hasPrevPage,
      hasNextPage: events.hasNextPage,
      prevPage: events.prevPage,
      nextPage: events.nextPage,
    },
    likedEvents: events.docs,
  });
});

//Organiser Logged In Methods
exports.createEvent = asyncHandler(async (req, res) => {
  const payload = {
    title: req.body.title,
    location: req.body.location,
    description: req.body.description,
    organizer: req.body.organizer || req.user?.id,
    views: req.body.views || 0,
    likes: req.body.likes || 0,
    imageURL: req.body.imageURL,
    postedAt: req.body.postedAt || Date.now(),
  };

  const event = await Event.create(payload);
  return res.status(201).json({ message: "Event Created Successfully", event });
});

exports.updateEvent = asyncHandler(async (req, res) => {
  const { id } = req.params;
  if (!mongoose.isValidObjectId(id))
    return res.status(400).json({ message: "Invalid event id" });

  const updates = {};
  const allowed = ["title", "location", "description", "imageURL", "postedAt"];
  allowed.forEach((k) => {
    if (req.body[k] !== undefined) updates[k] = req.body[k];
  });

  if (Object.keys(updates).length == 0)
    return res.status(400).json({ message: "Nothing to update" });

  const event = await Event.findById(id);
  if (!event) return res.status(404).json({ message: "Event not found" });

  if(event.organizer.toString() !== req.user.id)
    return res.status(403).json({ message: "Forbidden: You don't own this event" });
  
  Object.assign(event, updates);
  await event.save();

  return res.status(200).json({ message: "Event Updated Successfully", event });
});

exports.deleteEvent = asyncHandler(async (req, res) => {
  const { id } = req.params;
  if (!mongoose.isValidObjectId(id))
    return res.status(404).json({ message: "Invalid Event Id" });

  const event = await Event.findById(id);
  if (!event) return res.status(404).json({ message: "Event not found" });

  if(event.organizer.toString() !== req.user.id){
    return res.status(403).json({ message: "Forbidden: You don't own this event" });
  }

  await event.delete();
  
  return res.status(200).json({ message: "Event Deleted Successfully" });
});
