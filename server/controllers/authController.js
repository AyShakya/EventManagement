const { registerUser, loginUser, loginOrganiser } = require("../services/authServices.js");
const bcrypt = require('bcrypt');
const {User, Organiser} = require('../models/userModel.js');
const { default: transporter } = require("../config/nodeMailer.js");
const {
  createAccessToken,
  createRefreshTokenForUser,
  findUserByRefreshToken,
  rotateRefreshToken,
  removeRefreshToken,
  removeAllRefreshTokens,
} = require('../services/authTokenService');

const ACCESS_COOKIE_NAME = 'accessToken';
const REFRESH_COOKIE_NAME = 'refreshToken';

function cookieOptions(maxAgeMillis) {
  const isProd = process.env.NODE_ENV === 'production';
  return {
    httpOnly: true,
    secure: isProd,
    sameSite: isProd ? 'none' : 'lax',
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
    const {safeUser, userDoc} = await loginUser(email, password);

    const accessToken = createAccessToken({id:userDoc._id, userType: 'user'});

    const { refreshTokenPlain, expiresAt } = await createRefreshTokenForUser(
      'user',
      userDoc._id,
      req.ip,
      req.get('User-Agent') || ''
    );

    const accessAge = (Number(process.env.ACCESS_TOKEN_EXPIRES_MIN) || 15) * 60 * 1000;
    const refreshAge = (Number(process.env.REFRESH_TOKEN_EXPIRES_DAYS) || 7) * 24 * 60 * 60 * 1000;

    res.cookie(ACCESS_COOKIE_NAME, accessToken, cookieOptions(accessAge));
    res.cookie(REFRESH_COOKIE_NAME, refreshTokenPlain, cookieOptions(refreshAge));

    // const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
    //   expiresIn: "7d",
    // });
    // res.cookie("token", token, {
    //   httpOnly: true,
    //   secure: process.env.NODE_ENV === "production",
    //   sameSite: process.env.NODE_ENV === "production" ? "none" : "strict",
    //   maxAge: 7 * 24 * 60 * 60 * 1000,
    // });

    return res
      .status(200)
      .json({ message: "User Logged In Succesfully", user:safeUser, userType: 'user' });
  } catch (error) {
    next(error);
  }
};

exports.organiserLogin = async (req, res, next) => {
 try {
    const { email, password } = req.body;
    const { safeOrganiser, organiserDoc } = await loginOrganiser(email, password);

    const accessToken = createAccessToken({ id: organiserDoc._id, userType: 'organiser' });

    const { refreshTokenPlain, expiresAt } = await createRefreshTokenForUser(
      'organiser',
      organiserDoc._id,
      req.ip,
      req.get('User-Agent') || ''
    );

    const accessAge = (Number(process.env.ACCESS_TOKEN_EXPIRES_MIN) || 15) * 60 * 1000;
    const refreshAge = (Number(process.env.REFRESH_TOKEN_EXPIRES_DAYS) || 7) * 24 * 60 * 60 * 1000;

    res.cookie(ACCESS_COOKIE_NAME, accessToken, cookieOptions(accessAge));
    res.cookie(REFRESH_COOKIE_NAME, refreshTokenPlain, cookieOptions(refreshAge));

    return res
      .status(200)
      .json({ message: "Organiser Logged In Succesfully", user: safeOrganiser, userType: 'organiser' });
  } catch (error) {
    next(error); 
  }
};

exports.refreshToken = async (req, res, next) => {
  try {
    const refreshTokenPlain = req.cookies && req.cookies[REFRESH_COOKIE_NAME];
    if (!refreshTokenPlain) return res.status(401).json({ message: 'No refresh token' });

    const found = await findUserByRefreshToken(refreshTokenPlain);
    if (!found || !found.tokenObj) return res.status(401).json({ message: 'Invalid refresh token' });

    if (found.tokenObj.expiresAt < Date.now()) {
      await removeRefreshToken(found.modelType, found.account._id, refreshTokenPlain);
      return res.status(401).json({ message: 'Refresh token expired' });
    }

    // rotate
    const { refreshTokenPlain: newRefreshPlain, expiresAt } = await rotateRefreshToken(
      found.modelType,
      found.account._id,
      refreshTokenPlain,
      req.ip,
      req.get('User-Agent') || ''
    );

    const accessToken = createAccessToken({ id: found.account._id, userType: found.modelType || (found.modelType === 'organiser' ? 'organiser' : 'user')});

    const accessAge = (Number(process.env.ACCESS_TOKEN_EXPIRES_MIN) || 15) * 60 * 1000;
    const refreshAge = (Number(process.env.REFRESH_TOKEN_EXPIRES_DAYS) || 7) * 24 * 60 * 60 * 1000;

    res.cookie(ACCESS_COOKIE_NAME, accessToken, cookieOptions(accessAge));
    res.cookie(REFRESH_COOKIE_NAME, newRefreshPlain, cookieOptions(refreshAge));

    const account = found.account;
    const safeUser = {
      id: account._id,
      userName: account.userName || account.organiserName,
      email: account.email,
      userType: account.userType || found.modelType,
    }

    return res.status(200).json({ message: 'Token refreshed', user: safeUser });
  } catch (err) {
    next(err);
  }
};

exports.logout = async (req, res, next) => {
  try {
    const refreshTokenPlain = req.cookies && req.cookies[REFRESH_COOKIE_NAME];
    if (refreshTokenPlain && req.user && req.user.id) {
      await removeRefreshToken(req.user.userType, req.user.id, refreshTokenPlain);
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
    if(!req.user || !req.user.id) return res.status(401).json({ message: 'Not authenticated' });
    await removeAllRefreshTokens(req.user.userType, req.user.id);
    res.clearCookie(ACCESS_COOKIE_NAME, cookieOptions(0));
    res.clearCookie(REFRESH_COOKIE_NAME, cookieOptions(0));
    return res.status(200).json({ message: 'Logged out from all sessions' });
  } catch (error) {
    next(error);
  }
};

exports.resetOTP = async (req, res, next) => {
  const {email} = req.body;
  if(!email){
    return res.status(400).json({success: false, message: "Email is required"});
  }
  try {
    const user = await User.findOne({email});
    if(!user){
      return res.status(404).json({success: false, message: "User not found"});
    }
    const otp = String(Math.floor(100000 + Math.random()*900000));
    user.resetOTP = otp;
    user.resetOTPExpireAt = Date.now() + (15*60*1000);
    await user.save();

    const mailOption = {
      from: process.env.SENDER_EMAIL,
      to: user.email,
      subject: "Password Reset OTP",
      text: `Hello ${user.userName},\n\nYour OTP for password reset is ${otp}. It is valid for 15 minutes.\n\nBest regards,\nThe Team`
    }
    await transporter.sendMail(mailOption);
    return res.status(201).json({message: "OTP sent to your email"});
  } catch (error) {
    next(error);
  }
};

exports.resetPassword = async (req, res, next) => {
  const {email, otp, newPassword} = req.body;
  if(!email || !otp || !newPassword){
    return res.status(400).json({success: false, message: "Missing Details"});
  }
  try {
    const user = await User.findOne({email});
    if(!user){
      return res.status(404).json({success: false, message: "User not found"});
    }
    if(user.resetOTP === '' || user.resetOTP !== otp){
      return res.status(400).json({success: false, message: "Invalid OTP"});
    }
    if(user.resetOTPExpireAt < Date.now()){
      return res.status(400).json({success: false, message: "OTP Expired"});
    }
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    user.password = hashedPassword;
    user.resetOTP = '';
    user.resetOTPExpireAt = 0;
    await user.save();
    return res.status(200).json({success: true, message: "Password reset successful"});
  } catch (error) {
    next(error);
  }
};  