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

export default authRouter;
