import { Router } from "express";

import { authMiddleware } from "../../middlewares/auth.middleware";
import { requireRole } from "../../middlewares/role.middleware";
import {
  approveSellerController,
  listAdminSellersController,
  rejectSellerController,
  suspendSellerController,
} from "./admin-sellers.controller";
import {
  getAdminOrderController,
  listAdminOrdersController,
} from "../orders/orders.controller";
import {
  getAdminProductController,
  listAdminProductsController,
  updateAdminProductModerationController,
  updateAdminProductStatusController,
} from "./admin-products.controller";

export const adminRouter = Router();

adminRouter.use(authMiddleware, requireRole("admin"));

adminRouter.get("/sellers", listAdminSellersController);
adminRouter.patch("/sellers/:id/approve", approveSellerController);
adminRouter.patch("/sellers/:id/reject", rejectSellerController);
adminRouter.patch("/sellers/:id/suspend", suspendSellerController);
adminRouter.get("/orders", listAdminOrdersController);
adminRouter.get("/orders/:id", getAdminOrderController);
adminRouter.get("/products", listAdminProductsController);
adminRouter.get("/products/:id", getAdminProductController);
adminRouter.patch("/products/:id/status", updateAdminProductStatusController);
adminRouter.patch("/products/:id", updateAdminProductModerationController);
