import { Router } from "express";
import passport from "passport";

import { authMiddleware } from "../../middlewares/auth.middleware";
import {
  ensureGoogleOAuthConfigured,
  googleCallbackController,
  loginController,
  logoutController,
  meController,
  registerBuyerController,
  registerSellerController,
} from "./auth.controller";

export const authRouter = Router();

authRouter.post("/register-buyer", registerBuyerController);
authRouter.post("/register-seller", registerSellerController);
authRouter.post("/login", loginController);
authRouter.get(
  "/google",
  ensureGoogleOAuthConfigured,
  passport.authenticate("google", {
    scope: ["profile", "email"],
    session: false,
  }),
);
authRouter.get(
  "/google/callback",
  ensureGoogleOAuthConfigured,
  googleCallbackController,
);
authRouter.get("/me", authMiddleware, meController);
authRouter.post("/logout", logoutController);
