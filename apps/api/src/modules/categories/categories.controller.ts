import type { NextFunction, Request, RequestHandler, Response } from "express";

import { getActiveCategories } from "./categories.service";

function asyncHandler(
  handler: (req: Request, res: Response, next: NextFunction) => Promise<void>,
): RequestHandler {
  return (req, res, next) => {
    handler(req, res, next).catch(next);
  };
}

export const listCategoriesController = asyncHandler(async (_req, res) => {
  const categories = await getActiveCategories();

  res.status(200).json({ categories });
});
