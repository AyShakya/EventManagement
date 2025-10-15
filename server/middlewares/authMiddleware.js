const jwt = require("jsonwebtoken");
const JWT_SECRET = process.env.JWT_SECRET;
const {User} = require("../models/userModel");

function authenticateAccessToken(req, res, next) {
  try {
    const authHeader = req.headers.authorization;
    const tokenFromHeader =
      authHeader &&
      authHeader.startsWith("Bearer ") &&
      authHeader.split(" ")[1];
    const token = tokenFromHeader || (req.cookies && req.cookies.accessToken);
    if (!token) return res.status(401).json({ message: "No access token" });

    const payload = jwt.verify(token, JWT_SECRET);
    req.user = { id: payload.id, userType: payload.userType };
    return next();
  } catch (err) {
    return res.status(401).json({ message: "Invalid or expired access token" });
  }
}

function requireUserType(userType) {
  return (req, res, next) => {
    if (!req.user || !req.user.userType)
      return res.status(401).json({ message: "Unauthorized" });
    if (req.user.userType !== userType)
      return res.status(403).json({ message: "Forbidden" });
    return next();
  };
}

const optionalAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    const tokenFromHeader = authHeader && authHeader.startsWith('Bearer ') && authHeader.split(" ")[1];
    const token = tokenFromHeader || (req.cookies && req.cookies.accessToken);

    if(!token) {req.user=null; return next();}

    const decoded = jwt.verify(token, JWT_SECRET);
    const user = await User.findById(decoded.id).select("-password");
    if (user) req.user = { id: user._id, userType: user.userType };
    return next();
  } catch (err) {
    req.user = null;
    return next();
  }
};

module.exports = { authenticateAccessToken, requireUserType, optionalAuth };
