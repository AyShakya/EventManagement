const transporter = require("../config/nodeMailer");
const EmailToken = require("../models/emailTokenModel");
const { generateRandomTokenHex, hashToken } = require("./tokenUtils");

async function createAndSendVerificationEmail(user) {
  try {
    const token = generateRandomTokenHex(32);
    const tokenHash = hashToken(token);
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);

    const modelType =
      user.constructor && user.constructor.modelName
        ? user.constructor.modelName
        : user.userType && user.userType.toLowerCase() === "organizer"
        ? "Organizer"
        : "User";

    await EmailToken.create({
      userId: user._id,
      modelType,
      tokenHash,
      type: "verifyEmail",
      expiresAt,
    });

    const apiVerifyUrl = `${process.env.CLIENT_URL}/api/auth/verify-email?token=${token}`;

    const html = `
    <div style="font-family: Arial, sans-serif;line-height:1.5;">
      <h2>Verify your email</h2>
      <p>Hi ${user.userName || user.organizerName || user.name || ""},</p>
      <p>Click the button below to verify your email address.</p>
      <p style="text-align:center;margin:30px 0;">
        <a href="${apiVerifyUrl}" style="display:inline-block;padding:12px 20px;border-radius:6px;text-decoration:none;font-weight:600;">
          Verify email
        </a>
      </p>
      <p>If the button doesn't work, paste this link into your browser:</p>
      <pre style="white-space:pre-wrap;word-break:break-all;">${apiVerifyUrl}</pre>
      <p>This link will expire in 24 hours.</p>
    </div>
  `;

    const mailOption = {
      from: process.env.SENDER_EMAIL,
      to: user.email,
      subject: "Verify your email",
      html,
    };

    await transporter.sendMail(mailOption);
    return { sendTo: user.email, expiresAt };
  } catch (error) {
    next(error);
  }
}

async function findAccountByEmail(email) {
  let account = await User.findOne({ email });
  let kind = 'user';
  if (!account) {
    account = await Organizer.findOne({ email });
    kind = 'organizer';
  }
  return { account, kind };
}

module.exports = { createAndSendVerificationEmail, findAccountByEmail };
