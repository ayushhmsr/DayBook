import dns from "node:dns";
if (dns.setDefaultResultOrder) {
  dns.setDefaultResultOrder("ipv4first");
}

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
  connectionTimeout: 4000,
  greetingTimeout: 4000,
  socketTimeout: 4000,
  auth: authConfig,
  tls: {
    rejectUnauthorized: false,
  },
});

export const sendEmail = async (to, subject, text, html) => {
  const brevoApiKey = process.env.BREVO_API_KEY || config.brevoApiKey;
  // If BREVO_API_KEY is provided, send to ANY recipient email worldwide with 0 restrictions
  if (brevoApiKey) {
    try {
      const response = await fetch("https://api.brevo.com/v3/smtp/email", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "api-key": brevoApiKey,
          accept: "application/json",
        },
        body: JSON.stringify({
          sender: {
            name: "Daybook",
            email: config.googleUser || process.env.EMAIL_USER || "ayushhmishra17@gmail.com",
          },
          to: [{ email: to }],
          subject,
          htmlContent: html,
          textContent: text,
        }),
      });
      const data = await response.json();
      if (response.ok && data.messageId) {
        console.log("Email sent via Brevo HTTPS:", data.messageId);
        return { success: true, messageId: data.messageId };
      }
      console.warn("Brevo API error:", data);
    } catch (brevoErr) {
      console.warn("Brevo fetch error:", brevoErr.message);
    }
  }

  const resendApiKey = process.env.RESEND_API_KEY || config.resendApiKey;
  // If RESEND_API_KEY is configured, prioritize HTTPS API (100% reliable on all cloud hosts)
  if (resendApiKey) {
    try {
      const response = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${resendApiKey}`,
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
