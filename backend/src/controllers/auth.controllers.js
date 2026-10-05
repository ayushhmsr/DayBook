import User from "../models/user.model.js";
import Entry from "../models/entry.model.js";
import crypto from "crypto";
import jwt from "jsonwebtoken";
import config from "../config/config.js";
import Session from "../models/session.model.js";
import { sendEmail } from "../services/email.service.js";
import { 
  generateOtp, 
  getOtpHtml, 
  getWelcomeClubHtml, 
  getWelcomeClubText, 
  getReminderEmailHtml, 
  getReminderEmailText,
  getForgotPasswordOtpHtml,
  getForgotPasswordOtpText
} from "../utils/utils.js";
import OTP from "../models/otp.model.js";

export async function register(req, res) {
  try {
    const { email, password } = req.body;
    const name = req.body.name || req.body.user || req.body.username;

    if (!name || !email || !password) {
      return res.status(400).json({ message: "Name, email, and password are required" });
    }

    const isAlreadyRegistered = await User.findOne({
      $or: [{ name }, { email }],
    });

    if (isAlreadyRegistered) {
      return res.status(409).json({ message: "User already exists" });
    }

    const hashedPassword = crypto
      .createHash("sha256")
      .update(password)
      .digest("hex");

    const profession = req.body.profession || 'trader';
    const user = await User.create({ name, email, password: hashedPassword, profession });

    const otp = generateOtp();
    const htmlContent = getOtpHtml(otp);
    const otpHash = crypto.createHash("sha256").update(otp).digest("hex");

    await OTP.create({
      userId: user._id,
      email: user.email,
      otpHash,
    });

    await sendEmail(user.email, "Verify your email", `Your OTP is: ${otp}`, htmlContent);

    return res.status(201).json({
      message: "User registered successfully",
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        profession: user.profession,
        verified: user.verified,
      },
    });
  } catch (error) {
    console.error("Registration error:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
}

export async function login(req, res) {
  const { email, password } = req.body;

  const user = await User.findOne({ email });

  if (!user) {
    return res.status(401).json({ message: "Invalid email or password" });
  }

  if (!user.verified) {
    return res.status(403).json({ message: "Email not verified. Please verify your email before logging in." });
  }

  const hashedPassword = crypto
    .createHash("sha256")
    .update(password)
    .digest("hex");

  if (hashedPassword !== user.password) {
    return res.status(401).json({ message: "Invalid email or password" });
  }

  const refreshToken = jwt.sign(
    { id: user._id, jti: crypto.randomUUID() },
    config.jwtSecret || config.JWT_SECRET,
    { expiresIn: "7d" }
  );

  const session = await Session.create({
    user: user._id,
    refreshTokenHash: crypto.createHash("sha256").update(refreshToken).digest("hex"),
    ipAddress: req.ip,
    userAgent: req.headers["user-agent"] || "unknown",
  });

  const accessToken = jwt.sign(
    { id: user._id, sessionId: session._id },
    config.jwtSecret || config.JWT_SECRET,
    { expiresIn: "15m" }
  );

  res.cookie("refreshToken", refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });

  if (!user.welcomeEmailSent) {
    user.welcomeEmailSent = true;
    user.save().catch((err) => console.error("Error saving user welcomeEmailSent flag:", err));
    const welcomeHtml = getWelcomeClubHtml(user.name, user.profession);
    const welcomeText = getWelcomeClubText(user.name, user.profession);
    sendEmail(
      user.email,
      "🎉 Welcome to Daybook Club — You're Officially a Member!",
      welcomeText,
      welcomeHtml
    ).catch((err) => console.error("Error sending welcome club email:", err));
  }

  return res.status(200).json({
    message: "User logged in successfully",
    user: { id: user._id, name: user.name, email: user.email, profession: user.profession || 'trader' },
    accessToken,
  });
}

export async function getMe(req, res) {
  const token = req.headers.authorization?.split(" ")[1];

  if (!token) {
    return res.status(401).json({ message: "No token provided" });
  }

  let decoded;
  try {
    decoded = jwt.verify(token, config.jwtSecret || config.JWT_SECRET);
  } catch {
    return res.status(401).json({ message: "Invalid or expired token" });
  }

  const user = await User.findById(decoded.id);
  if (!user) {
    return res.status(404).json({ message: "User not found" });
  }

  return res.status(200).json({
    message: "User fetched successfully",
    id: user._id,
    name: user.name,
    email: user.email,
    profession: user.profession || 'trader',
  });
}

export async function refreshToken(req, res) {
  const refreshToken = req.cookies.refreshToken;

  if (!refreshToken) {
    return res.status(401).json({ message: "No refresh token provided" });
  }

  let decoded;
  try {
    decoded = jwt.verify(refreshToken, config.jwtSecret || config.JWT_SECRET);
  } catch {
    return res.status(401).json({ message: "Invalid or expired refresh token" });
  }

  const refreshTokenHash = crypto.createHash("sha256").update(refreshToken).digest("hex");
  const session = await Session.findOne({ user: decoded.id, refreshTokenHash, revoked: false });
  if (!session) {
    return res.status(401).json({ message: "Invalid refresh token" });
  }

  const accessToken = jwt.sign(
    { id: decoded.id, sessionId: session._id },
    config.jwtSecret || config.JWT_SECRET,
    { expiresIn: "15m" }
  );

  const newRefreshToken = jwt.sign(
    { id: decoded.id, jti: crypto.randomUUID() },
    config.jwtSecret || config.JWT_SECRET,
    { expiresIn: "7d" }
  );

  session.refreshTokenHash = crypto.createHash("sha256").update(newRefreshToken).digest("hex");
  await session.save();

  res.cookie("refreshToken", newRefreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });

  return res.status(200).json({
    message: "Access token refreshed successfully",
    accessToken,
  });
}

export async function logout(req, res) {
  const refreshToken = req.cookies.refreshToken;

  if (!refreshToken) {
    return res.status(400).json({ message: "No refresh token provided" });
  }

  const refreshedTokenHash = crypto.createHash("sha256").update(refreshToken).digest("hex");
  const session = await Session.findOne({ refreshTokenHash: refreshedTokenHash, revoked: false });
  if (!session) {
    return res.status(400).json({ message: "Invalid refresh token" });
  }

  session.revoked = true;
  await session.save();

  res.clearCookie("refreshToken");
  return res.status(200).json({ message: "User logged out successfully" });
}

export async function logoutAll(req, res) {
  const refreshToken = req.cookies.refreshToken;

  if (!refreshToken) {
    return res.status(400).json({ message: "No refresh token provided" });
  }

  let decoded;
  try {
    decoded = jwt.verify(refreshToken, config.jwtSecret || config.JWT_SECRET);
  } catch {
    return res.status(401).json({ message: "Invalid or expired refresh token" });
  }

  await Session.updateMany({ user: decoded.id, revoked: false }, { revoked: true });

  res.clearCookie("refreshToken");
  return res.status(200).json({ message: "User logged out from all sessions successfully" });
}

export async function verifyEmail(req, res) {
  const { email, otp } = req.body || {};
  
  if (!email || !otp) {
    return res.status(400).json({ message: "Email and OTP are required" });
  }

  const otpRecord = await OTP.findOne({ 
    email, 
    otpHash: crypto.createHash("sha256").update(otp).digest("hex") 
  });
  
  if (!otpRecord) {
    return res.status(400).json({ message: "Invalid OTP or email" });
  }

  const user = await User.findById(otpRecord.userId);
  if (!user) {
    return res.status(404).json({ message: "User not found" });
  }

  user.verified = true;
  const shouldSendWelcome = !user.welcomeEmailSent;
  if (shouldSendWelcome) {
    user.welcomeEmailSent = true;
  }
  await user.save();

  await OTP.deleteMany({ userId: otpRecord.userId });

  if (shouldSendWelcome) {
    const welcomeHtml = getWelcomeClubHtml(user.name, user.profession);
    const welcomeText = getWelcomeClubText(user.name, user.profession);
    sendEmail(
      user.email,
      "🎉 Welcome to Daybook Club — You're Officially a Member!",
      welcomeText,
      welcomeHtml
    ).catch((err) => console.error("Error sending welcome club email:", err));
  }

  return res.status(200).json({
    message: "Email verified successfully",
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      profession: user.profession || 'trader',
    },
  });
}

export async function sendDailyStreakReminders(req, res) {
  try {
    const todayStr = new Date().toISOString().split("T")[0];
    const users = await User.find({ verified: true });
    let sentCount = 0;

    for (const u of users) {
      const todayEntry = await Entry.findOne({ user: u._id, date: todayStr });
      if (!todayEntry) {
        const userEntries = await Entry.find({ user: u._id }).sort({ date: -1 }).limit(30);
        const streak = userEntries.length;
        const reminderHtml = getReminderEmailHtml(u.name, u.profession || 'trader', Math.max(1, streak));
        const reminderText = getReminderEmailText(u.name, u.profession || 'trader', Math.max(1, streak));

        sendEmail(
          u.email,
          "🔥 Keep your streak alive! Log today's Daybook before midnight",
          reminderText,
          reminderHtml
        ).catch((err) => console.error("Error sending daily reminder:", err));
        sentCount += 1;
      }
    }

    return res.status(200).json({
      message: `Daily streak reminders dispatched to ${sentCount} user(s).`,
      sentCount,
    });
  } catch (error) {
    console.error("Error dispatching daily streak reminders:", error);
    return res.status(500).json({ message: "Failed to dispatch reminders" });
  }
}

export async function forgotPassword(req, res) {
  try {
    const { email } = req.body || {};
    if (!email) {
      return res.status(400).json({ message: "Email is required" });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: "No account found with this email address" });
    }

    // Delete existing OTPs for this user
    await OTP.deleteMany({ userId: user._id });

    const otp = generateOtp();
    const otpHash = crypto.createHash("sha256").update(otp).digest("hex");

    await OTP.create({
      userId: user._id,
      email: user.email,
      otpHash,
    });

    const htmlContent = getForgotPasswordOtpHtml(user.name, otp);
    const textContent = getForgotPasswordOtpText(user.name, otp);

    await sendEmail(user.email, "🔒 Password Reset Code — Daybook", textContent, htmlContent);

    return res.status(200).json({
      message: "Password reset OTP sent to your email",
      email: user.email,
    });
  } catch (error) {
    console.error("Forgot password error:", error);
    return res.status(500).json({ message: "Failed to send reset code. Please try again." });
  }
}

export async function resetPassword(req, res) {
  try {
    const { email, otp, newPassword } = req.body || {};

    if (!email || !otp || !newPassword) {
      return res.status(400).json({ message: "Email, OTP, and new password are required" });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ message: "Password must be at least 6 characters long" });
    }

    const otpHash = crypto.createHash("sha256").update(otp).digest("hex");
    const otpRecord = await OTP.findOne({ email, otpHash });

    if (!otpRecord) {
      return res.status(400).json({ message: "Invalid or expired OTP code" });
    }

    const user = await User.findById(otpRecord.userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const hashedPassword = crypto
      .createHash("sha256")
      .update(newPassword)
      .digest("hex");

    user.password = hashedPassword;
    user.verified = true;
    await user.save();

    // Invalidate previous sessions for security
    await Session.updateMany({ user: user._id, revoked: false }, { revoked: true });

    // Delete used OTPs
    await OTP.deleteMany({ userId: user._id });

    return res.status(200).json({
      message: "Password reset successfully. You can now log in with your new password.",
    });
  } catch (error) {
    console.error("Reset password error:", error);
    return res.status(500).json({ message: "Failed to reset password. Please try again." });
  }
}



