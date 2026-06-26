import type { NextFunction, Request, RequestHandler, Response } from "express";
import { ZodError, type ZodSchema } from "zod";

import { HttpError } from "../../utils/http-error";
import {
  getCatalogProductBySlug,
  getCatalogProducts,
} from "./catalog.service";
import {
  catalogFiltersSchema,
  catalogProductSlugSchema,
} from "./catalog.schemas";

function parseInput<T>(schema: ZodSchema<T>, value: unknown, label: string): T {
  try {
    return schema.parse(value);
  } catch (error) {
    if (error instanceof ZodError) {
      const details = error.issues
        .map((issue) => `${issue.path.join(".")}: ${issue.message}`)
        .join("; ");

      throw new HttpError(400, `Invalid ${label}: ${details}`);
    }

    throw error;
  }
}

function asyncHandler(
  handler: (req: Request, res: Response, next: NextFunction) => Promise<void>,
): RequestHandler {
  return (req, res, next) => {
    handler(req, res, next).catch(next);
  };
}

export const listCatalogProductsController = asyncHandler(async (req, res) => {
  const filters = parseInput(catalogFiltersSchema, req.query, "query");
  const products = await getCatalogProducts(filters);

  res.status(200).json({ products });
});

export const getCatalogProductController = asyncHandler(async (req, res) => {
  const params = parseInput(catalogProductSlugSchema, req.params, "params");
  const product = await getCatalogProductBySlug(params.slug);

  res.status(200).json({ product });
});
