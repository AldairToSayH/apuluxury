import { Router } from "express";

import {
  getStoreController,
  listStoresController,
} from "./stores.controller";

export const storesRouter = Router();

storesRouter.get("/", listStoresController);
storesRouter.get("/:slug", getStoreController);
