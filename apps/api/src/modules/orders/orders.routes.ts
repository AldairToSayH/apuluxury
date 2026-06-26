import { Router } from "express";

import { authMiddleware } from "../../middlewares/auth.middleware";
import { requireRole } from "../../middlewares/role.middleware";
import {
  loadSellerTenant,
  requireApprovedSeller,
} from "../../middlewares/tenant.middleware";
import {
  createOrderController,
  getBuyerOrderController,
  getSellerOrderController,
  listBuyerOrdersController,
  listSellerOrdersController,
  trackOrderController,
  updateSellerOrderStatusController,
} from "./orders.controller";

export const ordersRouter = Router();

ordersRouter.post("/", authMiddleware, requireRole("buyer"), createOrderController);
ordersRouter.get("/track", trackOrderController);
ordersRouter.get("/my", authMiddleware, requireRole("buyer"), listBuyerOrdersController);
ordersRouter.get("/my/:id", authMiddleware, requireRole("buyer"), getBuyerOrderController);

ordersRouter.get(
  "/seller",
  authMiddleware,
  requireRole("seller"),
  loadSellerTenant,
  listSellerOrdersController,
);
ordersRouter.get(
  "/seller/:id",
  authMiddleware,
  requireRole("seller"),
  loadSellerTenant,
  getSellerOrderController,
);
ordersRouter.patch(
  "/seller/:id/status",
  authMiddleware,
  requireRole("seller"),
  loadSellerTenant,
  requireApprovedSeller,
  updateSellerOrderStatusController,
);
