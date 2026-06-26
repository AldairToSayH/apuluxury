import type { NextFunction, Request, RequestHandler, Response } from "express";
import { ZodError, type ZodSchema } from "zod";

import { HttpError } from "../../utils/http-error";
import {
  getPublicStoreBySlug,
  getPublicStores,
} from "./stores.service";
import {
  storeSlugParamsSchema,
  storesFiltersSchema,
} from "./stores.schemas";

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

export const listStoresController = asyncHandler(async (req, res) => {
  const filters = parseInput(storesFiltersSchema, req.query, "query");
  const stores = await getPublicStores(filters);

  res.status(200).json({ stores });
});

export const getStoreController = asyncHandler(async (req, res) => {
  const params = parseInput(storeSlugParamsSchema, req.params, "params");
  const store = await getPublicStoreBySlug(params.slug);

  res.status(200).json({ store });
});
