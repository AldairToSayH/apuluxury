import type { NextFunction, Request, RequestHandler, Response } from "express";
import { z, ZodError } from "zod";

import { HttpError } from "../../utils/http-error";
import {
  addProductImage,
  deleteProductImage,
  getProductImages,
  setMainProductImage,
  updateProductImage,
} from "./product-images.service";
import {
  createProductImageSchema,
  productImageDetailParamsSchema,
  productImageParamsSchema,
  updateProductImageSchema,
} from "./product-images.schemas";

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

function requireSeller(req: Request) {
  if (!req.seller) {
    throw new HttpError(403, "Seller profile is required");
  }

  return req.seller;
}

export const addProductImageController = asyncHandler(async (req, res) => {
  const params = parseInput(productImageParamsSchema, req.params, "params");
  const body = parseInput(createProductImageSchema, req.body, "request body");
  const image = await addProductImage(requireSeller(req), params.productId, body);

  res.status(201).json({ image });
});

export const listProductImagesController = asyncHandler(async (req, res) => {
  const params = parseInput(productImageParamsSchema, req.params, "params");
  const images = await getProductImages(requireSeller(req), params.productId);

  res.status(200).json({ images });
});

export const updateProductImageController = asyncHandler(async (req, res) => {
  const params = parseInput(productImageDetailParamsSchema, req.params, "params");
  const body = parseInput(updateProductImageSchema, req.body, "request body");
  const image = await updateProductImage(
    requireSeller(req),
    params.productId,
    params.imageId,
    body,
  );

  res.status(200).json({ image });
});

export const setMainProductImageController = asyncHandler(async (req, res) => {
  const params = parseInput(productImageDetailParamsSchema, req.params, "params");
  const image = await setMainProductImage(
    requireSeller(req),
    params.productId,
    params.imageId,
  );

  res.status(200).json({ image });
});

export const deleteProductImageController = asyncHandler(async (req, res) => {
  const params = parseInput(productImageDetailParamsSchema, req.params, "params");

  await deleteProductImage(requireSeller(req), params.productId, params.imageId);

  res.status(200).json({ success: true });
});
