const crypto = require('crypto');

function generateRandomTokenHex(size = 64) {
  return crypto.randomBytes(size).toString('hex');
}

function hashToken(tokenPlain) {
  return crypto.createHash('sha256').update(tokenPlain).digest('hex');
}

module.exports = { generateRandomTokenHex, hashToken };
