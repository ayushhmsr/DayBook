import nodemailer from "nodemailer";
import config from "../config/config.js";

const appPass = process.env.GMAIL_APP_PASSWORD || process.env.EMAIL_PASS;
const isAppPassword = !!appPass;

const authConfig = isAppPassword
  ? {
      user: config.googleUser || process.env.EMAIL_USER,
      pass: String(appPass).replace(/\s+/g, ""),
    }
  : {
      type: "OAuth2",
      user: config.googleUser,
      clientId: config.googleClientId,
      clientSecret: config.googleClientSecret,
      refreshToken: config.googleRefreshToken,
    };

const transporter = nodemailer.createTransport({
  service: "gmail",
  host: "smtp.gmail.com",
  port: 465,
  secure: true,
  auth: authConfig,
  connectionTimeout: 15000,
  greetingTimeout: 15000,
  socketTimeout: 20000,
});

export const sendEmail = async (to, subject, text, html) => {
  try {
    const info = await transporter.sendMail({
      from: `"Daybook" <${config.googleUser || process.env.EMAIL_USER}>`,
      to,
      subject,
      text,
      html,
    });

    console.log("Message sent: %s", info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error("Error sending email:", error.message || error);
    return { success: false, error: error.message || error };
  }
};

export default transporter;
