import express, { Router } from "express";
import * as authController from "../controllers/auth.controllers.js";
                
const authRouter = Router();

authRouter.post("/register", authController.register);

authRouter.post("/login", authController.login);

authRouter.get("/get-me", authController.getMe);

authRouter.get("/refresh-token", authController.refreshToken);

authRouter.post("/logout", authController.logout);

authRouter.post("/logout-all", authController.logoutAll);

authRouter.post("/verify-email", express.json({ type: "*/*" }), authController.verifyEmail);

authRouter.post("/send-reminders", authController.sendDailyStreakReminders);

authRouter.post("/forgot-password", authController.forgotPassword);
authRouter.post("/reset-password", authController.resetPassword);

authRouter.get("/test-email", async (req, res) => {
  const { sendEmail } = await import("../services/email.service.js");
  const config = (await import("../config/config.js")).default;
  const to = req.query.to || config.googleUser;
  const result = await sendEmail(to, "Daybook Test Verification", "Testing email delivery from Render.", "<p>Testing email delivery from Render.</p>");
  if (result.success) {
    return res.status(200).json({ success: true, message: `Email delivered to ${to}`, messageId: result.messageId });
  } else {
    return res.status(500).json({ success: false, error: result.error });
  }
});

export default authRouter;
