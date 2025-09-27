const jwt = require('jsonwebtoken');
const JWT_SECRET = process.env.JWT_SECRET;

function authenticateAccessToken(req, res, next) {
  const authHeader = req.headers.authorization;
  const tokenFromHeader = authHeader && authHeader.startsWith('Bearer ') && authHeader.split(' ')[1];
  const token = tokenFromHeader || (req.cookies && req.cookies.accessToken);
  if (!token) return res.status(401).json({ message: 'No access token' });

  try {
    const payload = jwt.verify(token, JWT_SECRET);
    req.user = { id: payload.id, userType: payload.userType };
    return next();
  } catch (err) {
    return res.status(401).json({ message: 'Invalid or expired access token' });
  }
}

function requireUserType(userType) {
  return (req, res, next) => {
    if (!req.user || !req.user.userType) return res.status(401).json({ message: 'Not authenticated' });
    if (req.user.userType !== userType) return res.status(403).json({ message: 'Forbidden' });
    next();
  };
}

module.exports = { authenticateAccessToken, requireUserType };
