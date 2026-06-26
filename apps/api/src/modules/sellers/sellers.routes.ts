import { Router } from "express";

import { authMiddleware } from "../../middlewares/auth.middleware";
import { requireRole } from "../../middlewares/role.middleware";
import {
  getMySellerProfileController,
  updateMySellerProfileController,
} from "./sellers.controller";

export const sellersRouter = Router();

sellersRouter.get(
  "/me",
  authMiddleware,
  requireRole("seller"),
  getMySellerProfileController,
);
sellersRouter.patch(
  "/me",
  authMiddleware,
  requireRole("seller"),
  updateMySellerProfileController,
);
