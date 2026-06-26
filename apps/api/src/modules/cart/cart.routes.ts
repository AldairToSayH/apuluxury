import { Router } from "express";

import { authMiddleware } from "../../middlewares/auth.middleware";
import { requireRole } from "../../middlewares/role.middleware";
import {
  addCartItemController,
  clearCartController,
  deleteCartItemController,
  getCartController,
  updateCartItemController,
} from "./cart.controller";

export const cartRouter = Router();

cartRouter.use(authMiddleware, requireRole("buyer"));

cartRouter.get("/", getCartController);
cartRouter.post("/items", addCartItemController);
cartRouter.patch("/items/:id", updateCartItemController);
cartRouter.delete("/items/:id", deleteCartItemController);
cartRouter.delete("/", clearCartController);
