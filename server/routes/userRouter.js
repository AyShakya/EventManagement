const express = require("express");
const { authenticateAccessToken, requireUserType } = require("../middlewares/authMiddleware");
const { User } = require("../models/userModel");
const Event = require("../models/eventModel");
const Query = require("../models/queryModel");
const asyncHandler = require("../utils/asyncHandler");

const userRouter = express.Router();

userRouter.use(authenticateAccessToken, requireUserType("user"));

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
      emailVerified: !!user.isEmailVerified,
    };

    return res.status(200).json({ user: safeUser });
  })
);

userRouter.get(
  "/me/stats",
  asyncHandler(async (req, res) => {
    const userId = req.user.id;

    const user = await User.findById(userId)
      .select("likedEvents")
      .lean();

    const [queriesCount] = await Promise.all([
      Query.countDocuments({ senderId: userId }),
    ]);

    const likes = user?.likedEvents?.length || 0;

    return res.status(200).json({
      likes,
      queries: queriesCount,
      attended: 0, 
    });
  })
);

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

userRouter.get(
  "/me/attended",
  asyncHandler(async (req, res) => {
    const limit = Math.min(50, Number(req.query.limit) || 10);
    return res.status(200).json({ events: [], meta: { total: 0, limit } });
  })
);

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
      select: "title location description organizer views likes images imageURL imagePublicId startAt postedAt",
    };

    const result = await Event.paginate(
      { _id: { $in: user.likedEvents || [] } },
      options
    );

    const likedEvents = result.docs.map((ev) => {
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
      likedEvents,
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
