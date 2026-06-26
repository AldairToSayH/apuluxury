import type { NextFunction, Request, RequestHandler, Response } from "express";
import { z, ZodError } from "zod";

import { HttpError } from "../../utils/http-error";
import {
  createSellerProduct,
  getMyProduct,
  listMyProducts,
  updateMyProduct,
  updateMyProductStatus,
} from "./products.service";
import {
  createProductSchema,
  sellerProductFiltersSchema,
  updateProductSchema,
  updateProductStatusSchema,
} from "./products.schemas";

function parseInput<T extends z.ZodTypeAny>(
  schema: T,
  value: unknown,
  label: string,
): z.infer<T> {
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

function getProductIdParam(req: Request): string {
  const { id } = req.params;

  if (typeof id !== "string" || id.length === 0) {
    throw new HttpError(400, "Product id is required");
  }

  return id;
}

function requireSellerFromRequest(req: Request) {
  if (!req.seller) {
    throw new HttpError(403, "Seller profile is required");
  }

  return req.seller;
}

export const createProductController = asyncHandler(async (req, res) => {
  const seller = requireSellerFromRequest(req);
  const body = parseInput(createProductSchema, req.body, "request body");
  const product = await createSellerProduct(seller, body);

  res.status(201).json({ product });
});

export const listMyProductsController = asyncHandler(async (req, res) => {
  const seller = requireSellerFromRequest(req);
  const filters = parseInput(sellerProductFiltersSchema, req.query, "query");
  const products = await listMyProducts(seller, filters);

  res.status(200).json({ products });
});

export const getMyProductController = asyncHandler(async (req, res) => {
  const seller = requireSellerFromRequest(req);
  const product = await getMyProduct(seller, getProductIdParam(req));

  res.status(200).json({ product });
});

export const updateMyProductController = asyncHandler(async (req, res) => {
  const seller = requireSellerFromRequest(req);
  const body = parseInput(updateProductSchema, req.body, "request body");
  const product = await updateMyProduct(seller, getProductIdParam(req), body);

  res.status(200).json({ product });
});

export const updateMyProductStatusController = asyncHandler(async (req, res) => {
  const seller = requireSellerFromRequest(req);
  const body = parseInput(updateProductStatusSchema, req.body, "request body");
  const product = await updateMyProductStatus(
    seller,
    getProductIdParam(req),
    body,
  );

  res.status(200).json({ product });
});
