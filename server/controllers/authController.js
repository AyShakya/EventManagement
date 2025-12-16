const {
  registerUser,
  loginUser,
  loginOrganizer,
} = require("../services/authServices.js");
const bcrypt = require("bcrypt");
const { User, Organizer } = require("../models/userModel.js");
const EmailToken = require("../models/emailTokenModel.js");
const transporter = require("../config/nodemailer.js");
const {
  createAccessToken,
  createRefreshTokenForUser,
  findUserByRefreshToken,
  rotateRefreshToken,
  removeRefreshToken,
  removeAllRefreshTokens,
} = require("../services/authTokenService");
const { hashToken } = require("../utils/tokenUtils.js");
const {
  createAndSendVerificationEmail,
  findAccountByEmail,
} = require("../utils/emailHandler.js");

const ACCESS_COOKIE_NAME = "accessToken";
const REFRESH_COOKIE_NAME = "refreshToken";

function cookieOptions(maxAgeMillis) {
  const isProd = process.env.NODE_ENV === "production";
  return {
    httpOnly: true,
    secure: isProd,
    sameSite: isProd ? "none" : "lax",
    maxAge: maxAgeMillis,
    domain: process.env.COOKIE_DOMAIN || undefined,
  };
}

exports.register = async (req, res, next) => {
  try {
    const { userName, email, password, userType } = req.body;
    const user = await registerUser(userName, email, password, userType);
    return res
      .status(201)
      .json({ message: "User registered successfully", user });
  } catch (error) {
    next(error);
  }
};

exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const { safeUser, userDoc } = await loginUser(email, password);

    const accessToken = createAccessToken({
      id: userDoc._id,
      userType: "user",
    });

    const { refreshTokenPlain, expiresAt } = await createRefreshTokenForUser(
      "user",
      userDoc._id,
      req.ip,
      req.get("User-Agent") || ""
    );

    const accessAge =
      (Number(process.env.ACCESS_TOKEN_EXPIRES_MIN) || 15) * 60 * 1000;
    const refreshAge =
      (Number(process.env.REFRESH_TOKEN_EXPIRES_DAYS) || 7) *
      24 *
      60 *
      60 *
      1000;

    res.cookie(ACCESS_COOKIE_NAME, accessToken, cookieOptions(accessAge));
    res.cookie(
      REFRESH_COOKIE_NAME,
      refreshTokenPlain,
      cookieOptions(refreshAge)
    );

    // const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
    //   expiresIn: "7d",
    // });
    // res.cookie("token", token, {
    //   httpOnly: true,
    //   secure: process.env.NODE_ENV === "production",
    //   sameSite: process.env.NODE_ENV === "production" ? "none" : "strict",
    //   maxAge: 7 * 24 * 60 * 60 * 1000,
    // });
    const responseUser = {
      ...safeUser,
      emailVerified: !!userDoc.isEmailVerified,
    };

    return res
      .status(200)
      .json({
        message: "User Logged In Succesfully",
        user: responseUser,
        userType: "user",
      });
  } catch (error) {
    next(error);
  }
};

exports.organizerLogin = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const { safeOrganizer, organizerDoc } = await loginOrganizer(
      email,
      password
    );

    const accessToken = createAccessToken({
      id: organizerDoc._id,
      userType: "organizer",
    });

    const { refreshTokenPlain, expiresAt } = await createRefreshTokenForUser(
      "organizer",
      organizerDoc._id,
      req.ip,
      req.get("User-Agent") || ""
    );

    const accessAge =
      (Number(process.env.ACCESS_TOKEN_EXPIRES_MIN) || 15) * 60 * 1000;
    const refreshAge =
      (Number(process.env.REFRESH_TOKEN_EXPIRES_DAYS) || 7) *
      24 *
      60 *
      60 *
      1000;

    res.cookie(ACCESS_COOKIE_NAME, accessToken, cookieOptions(accessAge));
    res.cookie(
      REFRESH_COOKIE_NAME,
      refreshTokenPlain,
      cookieOptions(refreshAge)
    );

    const responseUser = {
      ...safeOrganizer,
      emailVerified: !!organizerDoc.isEmailVerified,
    };

    return res
      .status(200)
      .json({
        message: "Organizer Logged In Succesfully",
        user: responseUser,
        userType: "organizer",
      });
  } catch (error) {
    next(error);
  }
};

exports.refreshToken = async (req, res, next) => {
  try {
    const refreshTokenPlain = req.cookies && req.cookies[REFRESH_COOKIE_NAME];
    if (!refreshTokenPlain)
      return res.status(401).json({ message: "No refresh token" });

    const found = await findUserByRefreshToken(refreshTokenPlain);
    if (!found || !found.tokenObj) {
      console.warn(
        "[refreshToken] refresh token not found - possible reuse or tampering",
        { ip: req.ip, ua: req.get("User-Agent") }
      );
      res.clearCookie(ACCESS_COOKIE_NAME, cookieOptions(0));
      res.clearCookie(REFRESH_COOKIE_NAME, cookieOptions(0));
      return res.status(401).json({ message: "Invalid refresh token" });
    }
    if (found.tokenObj.expiresAt < Date.now()) {
      await removeRefreshToken(
        found.modelType,
        found.account._id,
        refreshTokenPlain
      );
      res.clearCookie(ACCESS_COOKIE_NAME, cookieOptions(0));
      res.clearCookie(REFRESH_COOKIE_NAME, cookieOptions(0));
      return res.status(401).json({ message: "Refresh token expired" });
    }

    // console.log("[refreshToken] found token for", {
    //   modelType: found.modelType,
    //   accountId: found.account._id.toString(),
    //   expiresAt: found.tokenObj.expiresAt,
    // });

    let rotatedResult;
    try {
      rotatedResult = await rotateRefreshToken(
        found.modelType,
        found.account._id,
        refreshTokenPlain,
        req.ip,
        req.get("User-Agent") || ""
      );
    } catch (err) {
      // console.error("[refreshToken] rotate failed:", err.message);
      // res.clearCookie(ACCESS_COOKIE_NAME, cookieOptions(0));
      // res.clearCookie(REFRESH_COOKIE_NAME, cookieOptions(0));
      return res.status(401).json({ message: "Invalid refresh token" });
    }

    const accessToken = createAccessToken({
      id: found.account._id,
      userType:
        found.modelType.toLowerCase() ||
        (found.modelType === "organizer" ? "organizer" : "user"),
    });

    const accessAge =
      (Number(process.env.ACCESS_TOKEN_EXPIRES_MIN) || 15) * 60 * 1000;
    const refreshAge =
      (Number(process.env.REFRESH_TOKEN_EXPIRES_DAYS) || 7) *
      24 *
      60 *
      60 *
      1000;

    res.cookie(ACCESS_COOKIE_NAME, accessToken, cookieOptions(accessAge));
    res.cookie(
      REFRESH_COOKIE_NAME,
      rotatedResult.refreshTokenPlain,
      cookieOptions(refreshAge)
    );

    const account = found.account;
    const safeUser = {
      id: account._id,
      userName: account.userName || account.organizerName,
      email: account.email,
      userType: account.userType || found.modelType,
      emailVerified: !!account.isEmailVerified,
    };

    return res.status(200).json({ message: "Token refreshed", user: safeUser });
  } catch (err) {
    next(err);
  }
};

exports.logout = async (req, res, next) => {
  try {
    const refreshTokenPlain = req.cookies && req.cookies[REFRESH_COOKIE_NAME];
    if (refreshTokenPlain && req.user && req.user.id) {
      await removeRefreshToken(
        req.user.userType,
        req.user.id,
        refreshTokenPlain
      );
    }

    res.clearCookie(ACCESS_COOKIE_NAME, cookieOptions(0));
    res.clearCookie(REFRESH_COOKIE_NAME, cookieOptions(0));

    return res.status(200).json({
      message: "Logged out successfully",
    });
  } catch (error) {
    next(error);
  }
};

exports.logoutAll = async (req, res, next) => {
  try {
    if (!req.user || !req.user.id)
      return res.status(401).json({ message: "Not authenticated" });
    await removeAllRefreshTokens(req.user.userType, req.user.id);
    res.clearCookie(ACCESS_COOKIE_NAME, cookieOptions(0));
    res.clearCookie(REFRESH_COOKIE_NAME, cookieOptions(0));
    return res.status(200).json({ message: "Logged out from all sessions" });
  } catch (error) {
    next(error);
  }
};

exports.resetOTP = async (req, res, next) => {
  const { email } = req.body;
  if (!email) {
    return res
      .status(400)
      .json({ success: false, message: "Email is required" });
  }
  try {
    const { account, kind } = await findAccountByEmail(email);
    if (!account) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    const otp = String(Math.floor(100000 + Math.random() * 900000));
    account.resetOTP = otp;
    account.resetOTPExpireAt = Date.now() + 15 * 60 * 1000;
    await account.save();

    const displayName = account.userName || account.organizerName || "User";
    const mailOption = {
      from: process.env.SENDER_EMAIL,
      to: account.email,
      subject: "Password Reset OTP",
      text: `Hello ${displayName},\n\nYour OTP for password reset is ${otp}. It is valid for 15 minutes.\n\nBest regards,\nThe Team`,
    };
    await transporter.sendMail(mailOption);
    return res.status(201).json({ message: "OTP sent to your email" });
  } catch (error) {
    next(error);
  }
};

exports.resetPassword = async (req, res, next) => {
  const { email, otp, newPassword } = req.body;
  if (!email || !otp || !newPassword) {
    return res.status(400).json({ success: false, message: "Missing Details" });
  }
  try {
    const { account, kind } = await findAccountByEmail(email);
    if (!account) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }
    if (account.resetOTP === "" || account.resetOTP !== otp) {
      return res.status(400).json({ success: false, message: "Invalid OTP" });
    }
    if (!account.resetOTPExpireAt || account.resetOTPExpireAt < Date.now()) {
      return res.status(400).json({ success: false, message: "OTP Expired" });
    }
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    account.password = hashedPassword;
    account.resetOTP = "";
    account.resetOTPExpireAt = 0;
    await account.save();
    return res
      .status(200)
      .json({ success: true, message: "Password reset successful" });
  } catch (error) {
    next(error);
  }
};

exports.sendVerificationEmail = async (req, res, next) => {
  try {
    if (!req.user || !req.user.id)
      return res.status(401).json({ message: "Not authenticated" });

    const userTypeLower = (req.user.userType || "").toLowerCase();

    const Model = userTypeLower === "organizer" ? Organizer : User;

    const account = await Model.findById(req.user.id);
    if (!account) return res.status(404).json({ message: "Account not found" });

    if (account.isEmailVerified) {
      return res.status(400).json({ message: "Email already verified" });
    }

    await EmailToken.deleteMany({
      userId: account._id,
      modelType: account.userType,
      type: "verifyEmail",
    });

    await createAndSendVerificationEmail(account);

    return res
      .status(200)
      .json({ message: "Verification email sent. Check your inbox" });
  } catch (error) {
    next(error);
  }
};

exports.verifyEmail = async (req, res, next) => {
  try {
    const token =
      (req.body && req.body.token) ||
      (req.query && req.query.token) ||
      (req.query && req.query.t);
    if (!token) {
      return res.status(400).json({ message: "Missing token" });
    }

    const tokenHash = hashToken(token);

    const tokenRecord = await EmailToken.findOne({
      tokenHash,
      type: "verifyEmail",
    });
    if (!tokenRecord) return res.status(400).send("Invalid or expired token");

    if (tokenRecord.expiresAt < new Date()) {
      try {
        await EmailToken.findByIdAndDelete(tokenRecord._id);
        console.log(
          "[verifyEmail] deleted expired token",
          tokenRecord._id.toString()
        );
      } catch (delErr) {
        console.error("[verifyEmail] failed deleting expired token", delErr);
      }
      return res.status(400).send("Token expired");
    }

    let Model = null;
    if (tokenRecord.modelType === "User") {
      Model = User;
    } else if (tokenRecord.modelType === "Organizer") {
      Model = Organizer;
    } else {
      await EmailToken.findByIdAndDelete(tokenRecord._id);
      return res.status(400).send("Invalid user type");
    }

    const entity = await Model.findById(tokenRecord.userId);
    if (!entity) {
      await EmailToken.findByIdAndDelete(tokenRecord._id);
      return res.status(400).send("User not found");
    }

    entity.isEmailVerified = true;
    await entity.save();
    await EmailToken.findByIdAndDelete(tokenRecord._id);

    return res
      .status(200)
      .send(`Email verified successfully for ${tokenRecord.modelType}`);
  } catch (error) {
    next(error);
  }
};

exports.resendVerify = async (req, res, next) => {
  try {
    const { email } = req.body || {};
    if (!email) {
      return res.status(400).json({ message: "Email is required" });
    }

    const { account, kind } = await findAccountByEmail(email);
    if (!account) {
      return res
        .status(404)
        .json({ message: "Account with this email not found" });
    }

    if (account.isEmailVerified) {
      return res
        .status(400)
        .json({ message: "Email is already verified" });
    }

    // clean up any old verifyEmail tokens for this user+modelType
    await EmailToken.deleteMany({
      userId: account._id,
      modelType: kind === "organizer" ? "Organizer" : "User",
      type: "verifyEmail",
    });

    await createAndSendVerificationEmail(account);

    return res.status(200).json({
      message: "Verification email sent. Check your inbox.",
    });
  } catch (error) {
    next(error);
  }
};
