import { Router } from "express";

import { authMiddleware } from "../../middlewares/auth.middleware";
import { requireRole } from "../../middlewares/role.middleware";
import {
  loadSellerTenant,
  requireApprovedSeller,
} from "../../middlewares/tenant.middleware";
import {
  addProductImageController,
  deleteProductImageController,
  listProductImagesController,
  setMainProductImageController,
  updateProductImageController,
} from "./product-images.controller";

export const productImagesRouter = Router({ mergeParams: true });

const sellerImageAccess = [authMiddleware, requireRole("seller"), loadSellerTenant];
const approvedSellerImageAccess = [...sellerImageAccess, requireApprovedSeller];

productImagesRouter.post("/", approvedSellerImageAccess, addProductImageController);
productImagesRouter.get("/", sellerImageAccess, listProductImagesController);
productImagesRouter.patch(
  "/:imageId",
  approvedSellerImageAccess,
  updateProductImageController,
);
productImagesRouter.patch(
  "/:imageId/main",
  approvedSellerImageAccess,
  setMainProductImageController,
);
productImagesRouter.delete(
  "/:imageId",
  approvedSellerImageAccess,
  deleteProductImageController,
);
