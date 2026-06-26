import { Router } from "express";

import {
  getCatalogProductController,
  listCatalogProductsController,
} from "./catalog.controller";

export const catalogRouter = Router();

catalogRouter.get("/products", listCatalogProductsController);
catalogRouter.get("/products/:slug", getCatalogProductController);
