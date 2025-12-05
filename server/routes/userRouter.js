// routes/userRouter.js
const express = require("express");
const { authenticateAccessToken, requireUserType } = require("../middlewares/authMiddleware");
const { User } = require("../models/userModel");
const Event = require("../models/eventModel");
const Query = require("../models/queryModel");
const asyncHandler = require("../utils/asyncHandler");

const userRouter = express.Router();

// All routes here: must be logged in as normal user
userRouter.use(authenticateAccessToken, requireUserType("user"));

/**
 * GET /api/user/me
 * Return basic profile of logged-in user (no password, no refreshTokens)
 */
userRouter.get(
  "/me",
  asyncHandler(async (req, res) => {
    const user = await User.findById(req.user.id)
      .select("-password -refreshTokens")
      .lean();

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const safeUser = {
      id: user._id,
      userName: user.userName,
      email: user.email,
      userType: user.userType || "user",
      // map DB flag → frontend flag
      emailVerified: !!user.isEmailVerified,
    };

    return res.status(200).json({ user: safeUser });
  })
);

/**
 * GET /api/user/me/stats
 * - likes: count of likedEvents
 * - queries: total queries sent
 * - attended: (0 for now, until we implement attendance)
 */
userRouter.get(
  "/me/stats",
  asyncHandler(async (req, res) => {
    const userId = req.user.id;

    const user = await User.findById(userId)
      .select("likedEvents")
      .lean();

    const [queriesCount] = await Promise.all([
      Query.countDocuments({ senderId: userId }),
      // when we add attendance model, we’ll count that here too
    ]);

    const likes = user?.likedEvents?.length || 0;

    return res.status(200).json({
      likes,
      queries: queriesCount,
      attended: 0, // placeholder
    });
  })
);

/**
 * GET /api/user/me/queries
 * Recent queries sent by this user
 * Supports ?limit=
 */
userRouter.get(
  "/me/queries",
  asyncHandler(async (req, res) => {
    const userId = req.user.id;
    const limit = Math.min(50, Number(req.query.limit) || 10);

    const queries = await Query.find({ senderId: userId })
      .sort({ sentAt: -1 })
      .limit(limit)
      .lean();

    return res.status(200).json({ queries });
  })
);

/**
 * GET /api/user/me/attended
 * For now we don't have attendance model, so just return empty.
 * (Keeps UserDashboard happy and easy to upgrade later.)
 */
userRouter.get(
  "/me/attended",
  asyncHandler(async (req, res) => {
    const limit = Math.min(50, Number(req.query.limit) || 10);

    // TODO: when we add Event attendance/registration model,
    // actually query attended events here
    return res.status(200).json({ events: [], meta: { total: 0, limit } });
  })
);

/**
 * GET /api/user/me/liked
 * Paginated liked events for this user
 */
userRouter.get(
  "/me/liked",
  asyncHandler(async (req, res) => {
    const userId = req.user.id;
    const page = Math.max(1, Number(req.query.page) || 1);
    const limit = Math.min(100, Number(req.query.limit) || 8);

    const user = await User.findById(userId).select("likedEvents").lean();
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const options = {
      page,
      limit,
      lean: true,
      sort: { postedAt: -1 },
      select: "title location description organizer views likes imageURL postedAt",
    };

    const result = await Event.paginate(
      { _id: { $in: user.likedEvents || [] } },
      options
    );

    return res.status(200).json({
      likedEvents: result.docs,
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

module.exports = userRouter;
