import dotenv from "dotenv";
dotenv.config();

if (!process.env.MONGO_URI) {
  throw new Error("MONGO_URI is not defined in the environment variables");
}

if (!process.env.JWT_SECRET) {
  throw new Error("JWT_SECRET is not defined in the environment variables");
}

const config = {
  port: process.env.PORT || 3000,
  mongoURI: process.env.MONGO_URI,
  jwtSecret: process.env.JWT_SECRET,
  JWT_SECRET: process.env.JWT_SECRET,
  googleUser: process.env.GOOGLE_USER || process.env.EMAIL_USER || "ayushhmishra17@gmail.com",
  brevoApiKey: process.env.BREVO_API_KEY,
  resendApiKey: process.env.RESEND_API_KEY,
  resendFrom: process.env.RESEND_FROM || "Daybook <onboarding@resend.dev>",
};

export default config;