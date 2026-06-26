import { Router } from "express";

import { authMiddleware } from "../../middlewares/auth.middleware";
import { requireRole } from "../../middlewares/role.middleware";
import {
  getMyBuyerProfileController,
  updateMyBuyerProfileController,
} from "./buyers.controller";

export const buyersRouter = Router();

buyersRouter.get(
  "/me",
  authMiddleware,
  requireRole("buyer"),
  getMyBuyerProfileController,
);
buyersRouter.patch(
  "/me",
  authMiddleware,
  requireRole("buyer"),
  updateMyBuyerProfileController,
);
