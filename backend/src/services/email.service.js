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
  family: 4,
  auth: authConfig,
  tls: {
    rejectUnauthorized: false,
  },
});

export const sendEmail = async (to, subject, text, html) => {
  // If RESEND_API_KEY is configured, prioritize HTTPS API (100% reliable on all cloud hosts)
  if (process.env.RESEND_API_KEY) {
    try {
      const response = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
        },
        body: JSON.stringify({
          from: process.env.RESEND_FROM || "Daybook <onboarding@resend.dev>",
          to: [to],
          subject,
          text,
          html,
        }),
      });
      const data = await response.json();
      if (response.ok) {
        console.log("Email sent via Resend HTTPS:", data.id);
        return { success: true, messageId: data.id };
      }
      console.warn("Resend API error, falling back to SMTP:", data);
    } catch (resendErr) {
      console.warn("Resend fetch error, falling back to SMTP:", resendErr.message);
    }
  }

  try {
    const info = await transporter.sendMail({
      from: `"Daybook" <${config.googleUser || process.env.EMAIL_USER || "daybook.app@gmail.com"}>`,
      to,
      subject,
      text,
      html,
    });

    console.log("Message sent via SMTP: %s", info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error("Error sending email via SMTP:", error.message || error);
    return { success: false, error: error.message || error };
  }
};

export default transporter;
