const jwt = require('jsonwebtoken');
const { generateRandomTokenHex, hashToken } = require('../utils/tokenUtils');
const {User, Organizer} = require('../models/userModel');

const JWT_SECRET = process.env.JWT_SECRET;
const ACCESS_TOKEN_EXPIRES_MIN = Number(process.env.ACCESS_TOKEN_EXPIRES_MIN) || 15;
const REFRESH_TOKEN_EXPIRES_DAYS = Number(process.env.REFRESH_TOKEN_EXPIRES_DAYS) || 7;


/////////////////////////////////////
function createAccessToken(payload) {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: `${ACCESS_TOKEN_EXPIRES_MIN}m` });
}

function resolveModel(modelType){
  if(!modelType) return User;
  if(typeof modelType === 'string'){
    const t = modelType.toLowerCase();
    if(t==='organizer' || t==='organizer'){
      return Organizer;
    }
    if(t==='user') return User;
  }
  return modelType;
}

async function createRefreshTokenForUser(modelType ,accountId, ip = '', userAgent = '') {
  const Model = resolveModel(modelType);
  const refreshTokenPlain = generateRandomTokenHex(64);
  const tokenHash = hashToken(refreshTokenPlain);
  const now = Date.now();
  const expiresAt = now + REFRESH_TOKEN_EXPIRES_DAYS * 24 * 60 * 60 * 1000;

  console.log('[createRefreshTokenForUser] model:', Model.modelName, 'accountId:', accountId);
  console.log('[createRefreshTokenForUser] tokenHash:', tokenHash, 'expiresAt:', expiresAt);

  const account = await Model.findById(accountId);
  if (!account) {
    throw new Error(`${Model.modelName} not found when trying to save refresh token.`);
  }

  account.refreshTokens.push({
    tokenHash,
    createdAt: now,
    expiresAt,
    ip,
    userAgent
  })

  const saved = await account.save();

  const last = saved.refreshTokens[saved.refreshTokens.length - 1];
  console.log('[createRefreshTokenForUser] after save, total tokens:', saved.refreshTokens.length, 'last token obj:', last ? { tokenHash: last.tokenHash, expiresAt: last.expiresAt } : null);

  return { refreshTokenPlain, expiresAt };
}

async function findUserByRefreshToken(refreshTokenPlain) {
  const tokenHash = hashToken(refreshTokenPlain);

  let account = await User.findOne({'refreshTokens.tokenHash': tokenHash});
  if(account) {
    const tokenObj = account.refreshTokens.find(rt => rt.tokenHash === tokenHash);
    return { modelType: 'user', account, tokenObj};
  } 

  account = await Organizer.findOne({ 'refreshTokens.tokenHash': tokenHash});
  if(account){
    const tokenObj = account.refreshTokens.find(rt => rt.tokenHash === tokenHash);
    return { modelType: 'organizer', account, tokenObj};
  }
  return null;
}

async function rotateRefreshToken(modelType, accountId, oldRefreshTokenPlain, ip = '', userAgent = '') {
  const Model = resolveModel(modelType);
  const oldHash = hashToken(oldRefreshTokenPlain);

  const pulled = await Model.findByIdAndUpdate(accountId, {$pull: {
    refreshTokens: {
      tokenHash: oldHash
    }
  }},{new: true});

  if (!pulled) {
    throw new Error(`${Model.modelName} not found while rotating refresh token.`);
  }

  return createRefreshTokenForUser(modelType, accountId, ip, userAgent);
}

async function removeRefreshToken(modelType, accountId, refreshTokenPlain) {
  const Model = resolveModel(modelType);
  const tokenHash = hashToken(refreshTokenPlain);
  const updated = await Model.findByIdAndUpdate(accountId, { $pull: { refreshTokens: { tokenHash } } }, {new: true});
  if (!updated) {
    throw new Error(`${Model.modelName} not found while removing refresh token.`);
  }
}

async function removeAllRefreshTokens(modelType, accountId) {
  const Model = resolveModel(modelType);
  const updated = await Model.findByIdAndUpdate(accountId, { $set: { refreshTokens: [] } }, {new: true});
  if (!updated) {
    throw new Error(`${Model.modelName} not found while removing all refresh tokens.`);
  }
}

module.exports = {
  createAccessToken,
  createRefreshTokenForUser,
  findUserByRefreshToken,
  rotateRefreshToken,
  removeRefreshToken,
  removeAllRefreshTokens,
};
