const { User } = require("../models/userModel");
const Event = require("../models/eventModel");
const { default: mongoose } = require("mongoose");
const asyncHandler = require("../utils/asyncHandler");
const cloudinary = require("../config/cloudinary");
const { mapEventForClient, computeStage } = require("../utils/EventHelper");

//Individual Event Methods
exports.getAllEvents = asyncHandler(async (req, res) => {
  const page = Math.max(1, Number(req.query.page) || 1);
  const limit = Math.min(100, Number(req.query.limit) || 8);
  const q = (req.query.q || "").trim();

  const filter = {};
  if (q) {
    const re = new RegExp(q.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "i");
    filter.$or = [{ title: re }, { location: re }];
  }

  const options = {
    page,
    limit,
    lean: true,
    select:
      "title location description organizer views likes images imageURL imagePublicId startAt postedAt stats registrationFormURL",
  };

  const result = await Event.paginate(filter, options);
  if (!result || !result.docs.length) {
    return res.status(200).json({
      message: "No Event Found",
      events: [],
      meta: null,
    });
  }

  const events = result.docs.map((ev) => mapEventForClient(ev));

  return res.status(200).json({
    message: "Events Fetched",
    meta: {
      totalDocs: result.totalDocs,
      limit: result.limit,
      totalPages: result.totalPages,
      currentPage: result.page,
      pagingCounter: result.pagingCounter,
      hasPrevPage: result.hasPrevPage,
      hasNextPage: result.hasNextPage,
      prevPage: result.prevPage,
      nextPage: result.nextPage,
    },
    events,
  });
});

exports.getEventById = asyncHandler(async (req, res) => {
  const { id } = req.params;
  if (!mongoose.isValidObjectId(id))
    return res.status(404).json({ message: "Invalid Event Id" });

  const ev = await Event.findById(id).lean();
  if (!ev) return res.status(404).json({ message: "Missing Event" });

  const shouldIncrement =
    !req.user ||
    (req.user && req.user.id.toString() !== ev.organizer?.toString());

  if (shouldIncrement) {
    await Event.updateOne({ _id: id }, { $inc: { views: 1 } }).exec();
    ev.views = (ev.views || 0) + 1;
  }

  let liked = false;

  if (req.user && req.user.userType === "user") {
    const user = await User.findById(req.user.id).select("likedEvents").lean();

    liked =
      user?.likedEvents?.some(
        (evId) => evId.toString() === ev._id.toString()
      ) || false;
  }

  const normalized = mapEventForClient(ev);

  return res.status(200).json({
    message: "Event Sent",
    event: {
      ...normalized,
      liked,
    },
  });
});

//User Logged In Methods-
exports.likeEvent = asyncHandler(async (req, res) => {
  const eventId = req.params.id;
  const userId = req.user?.id || req.body.userId;
  if (!eventId || !userId)
    return res.status(400).json({ message: "Missing id(s)" });
  if (!mongoose.isValidObjectId(eventId) || !mongoose.isValidObjectId(userId))
    return res.status(404).json({ message: "Missing Id" });

  const session = await mongoose.startSession();
  try {
    session.startTransaction();

    const userAdded = await User.findOneAndUpdate(
      { _id: userId, likedEvents: { $ne: eventId } },
      { $addToSet: { likedEvents: eventId } },
      { new: true, session }
    ).lean();

    if (userAdded) {
      const event = await Event.findByIdAndUpdate(
        eventId,
        { $inc: { likes: 1 } },
        { new: true, session }
      ).lean();

      if (!event) {
        await User.findByIdAndUpdate(
          userId,
          { $pull: { likedEvents: eventId } },
          { session }
        );
        await session.abortTransaction();
        return res.status(404).json({ message: "Event not found" });
      }

      await session.commitTransaction();
      return res
        .status(200)
        .json({ message: "Event Liked", event: mapEventForClient(event) });
    }

    const userExists = await User.findById(userId).lean();
    if (!userExists) {
      await session.abortTransaction();
      return res.status(404).json({ message: "User not found" });
    }

    const decrementedEvent = await Event.findOneAndUpdate(
      { _id: eventId, likes: { $gt: 0 } },
      { $inc: { likes: -1 } },
      { new: true, session }
    ).lean();

    if (decrementedEvent) {
      await User.findByIdAndUpdate(
        userId,
        { $pull: { likedEvents: eventId } },
        { session }
      );
      await session.commitTransaction();
      return res.status(200).json({
        message: "Event Unliked",
        event: mapEventForClient(decrementedEvent),
      });
    }

    const eventExists = await Event.findById(eventId).lean();
    if (!eventExists) {
      await session.abortTransaction();
      return res.status(404).json({ message: "Event not found" });
    }

    await User.findByIdAndUpdate(
      userId,
      { $pull: { likedEvents: eventId } },
      { session }
    );
    await session.commitTransaction();
    return res.status(200).json({ message: "Event Unliked", event: null });
  } catch (err) {
    await session.abortTransaction();
    throw err;
  } finally {
    session.endSession();
  }
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
      "title location description organizer views likes images imageURL imagePublicId startAt postedAt stats registrationFormURL",
  };

  const events = await Event.paginate(
    { _id: { $in: user.likedEvents } },
    options
  );
  const likedEvents = events.docs.map((ev) => mapEventForClient(ev));

  return res.status(200).json({
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
    likedEvents,
  });
});

//Organizer Logged In Methods
exports.createEvent = asyncHandler(async (req, res) => {
  const payload = {
    title: req.body.title,
    location: req.body.location,
    description: req.body.description,
    organizer: req.body.organizer || req.user?.id,
    views: req.body.views || 0,
    likes: req.body.likes || 0,
    images: Array.isArray(req.body.images)
      ? req.body.images
      : req.body.imageURL
      ? [req.body.imageURL]
      : [],
    imagePublicId: req.body.imagePublicId || undefined,
    startAt: req.body.startAt || undefined,
    postedAt: req.body.postedAt || Date.now(),
    registrationFormURL: req.body.registrationFormURL || undefined,
  };

  const event = await Event.create(payload);
  const normalized = mapEventForClient(event.toObject());

  return res
    .status(201)
    .json({ message: "Event Created Successfully", event: normalized });
});

exports.updateEvent = asyncHandler(async (req, res) => {
  const { id } = req.params;
  if (!mongoose.isValidObjectId(id))
    return res.status(400).json({ message: "Invalid event id" });

  const updates = {};
  const allowed = [
    "title",
    "location",
    "description",
    "images",
    "imageURL",
    "imagePublicId",
    "postedAt",
    "startAt",
    "registrationFormURL",
  ];
  allowed.forEach((k) => {
    if (req.body[k] !== undefined) updates[k] = req.body[k];
  });

  if (Object.keys(updates).length == 0)
    return res.status(400).json({ message: "Nothing to update" });

  const event = await Event.findById(id);
  if (!event) return res.status(404).json({ message: "Event not found" });

  if (event.organizer.toString() !== req.user.id)
    return res
      .status(403)
      .json({ message: "Forbidden: You don't own this event" });

  // If a new imagePublicId is provided and differs from old, delete old image
  if (
    updates.imagePublicId &&
    event.imagePublicId &&
    updates.imagePublicId !== event.imagePublicId
  ) {
    try {
      await cloudinary.uploader.destroy(event.imagePublicId);
    } catch (e) {
      console.error("Failed to delete old cloudinary image", e);
    }
  }
  // normalize images if imageURL provided
  if (updates.imageURL && !updates.images) {
    updates.images = [updates.imageURL];
  }

  Object.assign(event, updates);
  await event.save();

  const normalized = mapEventForClient(event.toObject());

  return res
    .status(200)
    .json({ message: "Event Updated Successfully", event: normalized });
});

exports.deleteEvent = asyncHandler(async (req, res) => {
  const { id } = req.params;
  if (!mongoose.isValidObjectId(id))
    return res.status(404).json({ message: "Invalid Event Id" });

  const event = await Event.findById(id);
  if (!event) return res.status(404).json({ message: "Event not found" });

  if (event.organizer.toString() !== req.user.id) {
    return res
      .status(403)
      .json({ message: "Forbidden: You don't own this event" });
  }

  if (event.imagePublicId) {
    try {
      await cloudinary.uploader.destroy(event.imagePublicId);
    } catch (err) {
      console.error("[deleteEvent] failed to delete cloudinary image", err);
    }
  }

  await event.deleteOne();

  return res.status(200).json({ message: "Event Deleted Successfully" });
});

exports.uploadEventImage = asyncHandler(async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: "No file uploaded" });
  }

  try {
    const base64 = `data:${req.file.mimetype};base64,${req.file.buffer.toString(
      "base64"
    )}`;

    const result = await cloudinary.uploader.upload(base64, {
      folder: "events",
    });

    return res.status(201).json({
      message: "Image uploaded",
      imageURL: result.secure_url,
      publicId: result.public_id,
    });
  } catch (err) {
    console.error("Cloudinary upload error:", err);
    return res.status(500).json({
      message: "Failed to upload image",
      error: err.message,
    });
  }
});

exports.updateEventStats = asyncHandler(async (req, res) => {
  const { id } = req.params;
  if (!mongoose.isValidObjectId(id)) {
    return res.status(400).json({ message: "Invalid event id" });
  }

  const event = await Event.findById(id);
  if (!event) {
    return res.status(404).json({ message: "Event not found" });
  }

  if (event.organizer.toString() !== req.user.id) {
    return res
      .status(403)
      .json({ message: "Forbidden: You don't own this event" });
  }

  const { stage } = computeStage(event.startAt);
  if (stage !== "completed") {
    return res.status(400).json({
      message:
        "Stats can only be filled after the event has started / completed",
    });
  }

  const {
    totalAttendees,
    expectedAttendees,
    averageRating,
    revenue,
    cost,
    highlights,
    notes,
    isPublished,
  } = req.body;

  const statsUpdates = {};

  if (totalAttendees !== undefined) {
    const n = Number(totalAttendees);
    if (Number.isNaN(n) || n < 0) {
      return res
        .status(400)
        .json({ message: "totalAttendees must be a non-negative number" });
    }
    statsUpdates.totalAttendees = n;
  }

  if (expectedAttendees !== undefined) {
    const n = Number(expectedAttendees);
    if (Number.isNaN(n) || n < 0) {
      return res
        .status(400)
        .json({ message: "expectedAttendees must be a non-negative number" });
    }
    statsUpdates.expectedAttendees = n;
  }

  if (averageRating !== undefined) {
    const n = Number(averageRating);
    if (Number.isNaN(n) || n < 0 || n > 5) {
      return res
        .status(400)
        .json({ message: "averageRating must be between 0 and 5" });
    }
    statsUpdates.averageRating = n;
  }

  if (revenue !== undefined) {
    const n = Number(revenue);
    if (Number.isNaN(n) || n < 0) {
      return res
        .status(400)
        .json({ message: "revenue must be a non-negative number" });
    }
    statsUpdates.revenue = n;
  }

  if (cost !== undefined) {
    const n = Number(cost);
    if (Number.isNaN(n) || n < 0) {
      return res
        .status(400)
        .json({ message: "cost must be a non-negative number" });
    }
    statsUpdates.cost = n;
  }

  if (highlights !== undefined) {
    statsUpdates.highlights = String(highlights);
  }

  if (notes !== undefined) {
    statsUpdates.notes = String(notes);
  }

  if (isPublished !== undefined) {
    statsUpdates.isPublished = Boolean(isPublished);
  }

  if (Object.keys(statsUpdates).length === 0) {
    return res.status(400).json({ message: "Nothing to update in stats" });
  }

  event.stats = {
    ...(event.stats || {}),
    ...statsUpdates,
    filled: true,
    filledAt: new Date(),
  };

  await event.save();

  // if you already have a mapEventForClient helper, you can use it here
  const updated = mapEventForClient(event.toObject());

  return res
    .status(200)
    .json({ message: "Event stats updated", event: updated });
});
