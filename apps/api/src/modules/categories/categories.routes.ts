import { Router } from "express";

import { listCategoriesController } from "./categories.controller";

export const categoriesRouter = Router();

categoriesRouter.get("/", listCategoriesController);
