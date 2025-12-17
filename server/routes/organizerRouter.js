const express = require("express");
const { authenticateAccessToken, requireUserType } = require("../middlewares/authMiddleware");
const { Organizer } = require("../models/userModel");
const Event = require("../models/eventModel");
const Query = require("../models/queryModel");
const asyncHandler = require("../utils/asyncHandler");

const organizerRouter = express.Router();

organizerRouter.use(authenticateAccessToken, requireUserType("organizer"));

organizerRouter.get(
  "/me",
  asyncHandler(async (req, res) => {
    const organizer = await Organizer.findById(req.user.id)
      .select("-password -refreshTokens")
      .lean();

    if (!organizer) {
      return res.status(404).json({ message: "Organizer not found" });
    }

    const safeUser = {
      id: organizer._id,
      userName: organizer.organizerName, 
      email: organizer.email,
      userType: organizer.userType || "organizer",
      emailVerified: !!organizer.isEmailVerified,
    };

    return res.status(200).json({ user: safeUser });
  })
);

organizerRouter.get(
  "/me/events",
  asyncHandler(async (req, res) => {
    const page = Math.max(1, Number(req.query.page) || 1);
    const limit = Math.min(100, Number(req.query.limit) || 8);

    const options = {
      page,
      limit,
      lean: true,
      sort: { postedAt: -1 },
      select: "title location description organizer views likes imageURL postedAt startAt stats",
    };

    const result = await Event.paginate({ organizer: req.user.id }, options);

    const events = result.docs.map((ev) => {
      const images =
        Array.isArray(ev.images) && ev.images.length
          ? ev.images
          : ev.imageURL
          ? [ev.imageURL]
          : [];
      const imageURL = images[0] || null;
      return { ...ev, images, imageURL };
    });

    return res.status(200).json({
      events,
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
    });
  })
);

organizerRouter.get(
  "/me/stats",
  asyncHandler(async (req, res) => {
    const organizerId = req.user.id;

    const [eventsCount, queriesCount, eventsForAttendees] = await Promise.all([
      Event.countDocuments({ organizer: organizerId }),
      Query.countDocuments({ organizerId }),
      Event.find({ organizer: organizerId })
        .select("stats.totalAttendees")
        .lean(),
    ]);

    const totalAttendees = eventsForAttendees.reduce((sum, ev) => {
      const n = ev.stats?.totalAttendees;
      return sum + (typeof n === "number" ? n : 0);
    }, 0);

    return res.status(200).json({
      events: eventsCount,
      attendees: totalAttendees,
      queries: queriesCount,
    });
  })
);

module.exports = organizerRouter;
