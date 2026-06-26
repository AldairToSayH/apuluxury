import { Router } from "express";

import { authMiddleware } from "../../middlewares/auth.middleware";
import { requireRole } from "../../middlewares/role.middleware";
import {
  loadSellerTenant,
  requireApprovedSeller,
} from "../../middlewares/tenant.middleware";
import {
  createProductController,
  getMyProductController,
  listMyProductsController,
  updateMyProductController,
  updateMyProductStatusController,
} from "./products.controller";
import { productImagesRouter } from "../product-images/product-images.routes";

export const productsRouter = Router();

const sellerProductAccess = [authMiddleware, requireRole("seller"), loadSellerTenant];
const approvedSellerProductAccess = [...sellerProductAccess, requireApprovedSeller];

productsRouter.post("/", approvedSellerProductAccess, createProductController);
productsRouter.get("/me", sellerProductAccess, listMyProductsController);
productsRouter.use("/me/:productId/images", productImagesRouter);
productsRouter.get("/me/:id", sellerProductAccess, getMyProductController);
productsRouter.patch(
  "/me/:id",
  approvedSellerProductAccess,
  updateMyProductController,
);
productsRouter.patch(
  "/me/:id/status",
  approvedSellerProductAccess,
  updateMyProductStatusController,
);
