const jwt = require("jsonwebtoken");
const JWT_SECRET = process.env.JWT_SECRET;
const { User, Organizer } = require("../models/userModel");

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
    const tokenFromHeader =
      authHeader &&
      authHeader.startsWith("Bearer ") &&
      authHeader.split(" ")[1];
    const token = tokenFromHeader || (req.cookies && req.cookies.accessToken);

    if (!token) {
      req.user = null;
      return next();
    }
    const decoded = jwt.verify(token, JWT_SECRET);
    let model = User;
    if (
      decoded.userType &&
      String(decoded.userType).toLowerCase() === "organizer"
    )
      model = Organizer;
    const account = await model.findById(decoded.id).select("-password");
    if (account)
      req.user = {
        id: account._id.toString(),
        userType: account.userType || decoded.userType,
      };
    return next();
  } catch (err) {
    req.user = null;
    return next();
  }
};

module.exports = { authenticateAccessToken, requireUserType, optionalAuth };
