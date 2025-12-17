const jwt = require("jsonwebtoken");
const { generateRandomTokenHex, hashToken } = require("../utils/tokenUtils");
const { User, Organizer } = require("../models/userModel");
const { default: mongoose } = require("mongoose");

const JWT_SECRET = process.env.JWT_SECRET;
const ACCESS_TOKEN_EXPIRES_MIN =
  Number(process.env.ACCESS_TOKEN_EXPIRES_MIN) || 15;
const REFRESH_TOKEN_EXPIRES_DAYS =
  Number(process.env.REFRESH_TOKEN_EXPIRES_DAYS) || 7;

const MAX_REFRESH_TOKENS = Number(process.env.MAX_REFRESH_TOKENS) || 5;

function createAccessToken(payload) {
  return jwt.sign(payload, JWT_SECRET, {
    expiresIn: `${ACCESS_TOKEN_EXPIRES_MIN}m`,
  });
}

function resolveModel(modelType) {
  if (!modelType) return User;
  if (typeof modelType === "string") {
    const t = modelType.toLowerCase();
    if (t === "organizer") {
      return Organizer;
    }
    if (t === "user") return User;
  }
  return modelType;
}

async function createRefreshTokenForUser(
  modelType,
  accountId,
  ip = "",
  userAgent = ""
) {
  const Model = resolveModel(modelType);
  const refreshTokenPlain = generateRandomTokenHex(64);
  const tokenHash = hashToken(refreshTokenPlain);
  const now = Date.now();
  const expiresAt = now + REFRESH_TOKEN_EXPIRES_DAYS * 24 * 60 * 60 * 1000;

  const session = await mongoose.startSession();
  try {
    session.startTransaction();

    const account = await Model.findById(accountId).session(session);
    if (!account) {
      throw new Error(
        `${Model.modelName} not found when trying to save refresh token.`
      );
    }

    await Model.updateOne(
      { _id: accountId },
      { $pull: { refreshTokens: { expiresAt: { $lt: Date.now() } } } },
      { session }
    );

    const tokenObj = {
      tokenHash,
      createdAt: now,
      expiresAt,
      ip,
      userAgent,
    };

    await Model.updateOne(
      { _id: accountId },
      {
        $push: {
          refreshTokens: {
            $each: [tokenObj],
            $slice: -Math.max(1, MAX_REFRESH_TOKENS),
          },
        },
      },
      { session }
    );

    await session.commitTransaction();
    session.endSession();
    return { refreshTokenPlain, expiresAt };
  } catch (err) {
    await session.abortTransaction();
    session.endSession();
    throw err;
  }
}

async function findUserByRefreshToken(refreshTokenPlain) {
  const tokenHash = hashToken(refreshTokenPlain);

  let account = await User.findOne({ "refreshTokens.tokenHash": tokenHash });
  if (account) {
    const tokenObj = account.refreshTokens.find(
      (rt) => rt.tokenHash === tokenHash
    );
    return { modelType: "user", account, tokenObj };
  }

  account = await Organizer.findOne({ "refreshTokens.tokenHash": tokenHash });
  if (account) {
    const tokenObj = account.refreshTokens.find(
      (rt) => rt.tokenHash === tokenHash
    );
    return { modelType: "organizer", account, tokenObj };
  }
  return null;
}

async function rotateRefreshToken(
  modelType,
  accountId,
  oldRefreshTokenPlain,
  ip = "",
  userAgent = ""
) {
  const Model = resolveModel(modelType);
  const oldHash = hashToken(oldRefreshTokenPlain);

  const session = await mongoose.startSession();
  try {
    session.startTransaction();

    const account = await Model.findById(accountId).session(session);
    if (!account) {
      throw new Error(
        `${Model.modelName} not found while rotating refresh token.`
      );
    }

    const idx = account.refreshTokens.findIndex(
      (rt) => rt.tokenHash === oldHash
    );
    if (idx === -1) {
      throw new Error(
        "Old refresh token not found for this account — possible token reuse or already rotated."
      );
    }

    const newRefreshPlain = generateRandomTokenHex(64);
    const newHash = hashToken(newRefreshPlain);
    const now = Date.now();
    const expiresAt = now + REFRESH_TOKEN_EXPIRES_DAYS * 24 * 60 * 60 * 1000;

    const newTokenObj = {
      tokenHash: newHash,
      createdAt: now,
      expiresAt,
      ip,
      userAgent,
    };

    account.refreshTokens.splice(idx, 1, newTokenObj);

    account.refreshTokens = account.refreshTokens
      .filter((rt) => rt.expiresAt > now)
      .slice(-Math.max(1, MAX_REFRESH_TOKENS));

    await account.save({ session });

    await session.commitTransaction();
    session.endSession();
    return { refreshTokenPlain: newRefreshPlain, expiresAt };
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    throw error;
  }
}

async function removeRefreshToken(modelType, accountId, refreshTokenPlain) {
  const Model = resolveModel(modelType);
  const tokenHash = hashToken(refreshTokenPlain);
  const updated = await Model.findByIdAndUpdate(
    accountId,
    { $pull: { refreshTokens: { tokenHash } } },
    { new: true }
  );
  if (!updated) {
    throw new Error(
      `${Model.modelName} not found while removing refresh token.`
    );
  }
}

async function removeAllRefreshTokens(modelType, accountId) {
  const Model = resolveModel(modelType);
  const updated = await Model.findByIdAndUpdate(
    accountId,
    { $set: { refreshTokens: [] } },
    { new: true }
  );
  if (!updated) {
    throw new Error(
      `${Model.modelName} not found while removing all refresh tokens.`
    );
  }
}

async function pruneExpiredTokens() {
  const now = Date.now();
  await User.updateMany(
    {},
    { $pull: { refreshTokens: { expiresAt: { $lte: now } } } }
  );
  await Organizer.updateMany(
    {},
    { $pull: { refreshTokens: { expiresAt: { $lte: now } } } }
  );
}

module.exports = {
  createAccessToken,
  createRefreshTokenForUser,
  findUserByRefreshToken,
  rotateRefreshToken,
  removeRefreshToken,
  removeAllRefreshTokens,
  pruneExpiredTokens,
};