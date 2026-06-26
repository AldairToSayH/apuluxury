import type { NextFunction, Request, RequestHandler, Response } from "express";
import { z, ZodError } from "zod";

import { HttpError } from "../../utils/http-error";
import {
  changeAdminProductStatus,
  getAdminProductDetail,
  getAdminProducts,
  updateAdminProductModerationFields,
} from "./admin-products.service";

const productStatusSchema = z.enum(["draft", "active", "inactive", "rejected"]);

const optionalDate = z
  .string()
  .trim()
  .refine((value) => !Number.isNaN(Date.parse(value)), "Invalid date")
  .optional();

const adminProductFiltersSchema = z.object({
  status: productStatusSchema.optional(),
  seller_id: z.string().uuid().optional(),
  category_id: z.string().uuid().optional(),
  search: z.string().trim().min(1).optional(),
  from: optionalDate,
  to: optionalDate,
});

const adminProductParamsSchema = z.object({
  id: z.string().uuid(),
});

const updateProductStatusSchema = z
  .object({
    status: productStatusSchema,
    note: z.string().trim().min(1).optional(),
  })
  .strict();

const updateProductModerationSchema = z
  .object({
    status: productStatusSchema.optional(),
    category_id: z.string().uuid().optional(),
  })
  .strict()
  .refine((value) => Object.keys(value).length > 0, {
    message: "At least one field must be provided",
  });

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

function getProductId(req: Request): string {
  const params = parseInput(adminProductParamsSchema, req.params, "params");

  return params.id;
}

export const listAdminProductsController = asyncHandler(async (req, res) => {
  const filters = parseInput(adminProductFiltersSchema, req.query, "query");
  const products = await getAdminProducts(filters);

  res.status(200).json({ products });
});

export const getAdminProductController = asyncHandler(async (req, res) => {
  const product = await getAdminProductDetail(getProductId(req));

  res.status(200).json({ product });
});

export const updateAdminProductStatusController = asyncHandler(
  async (req, res) => {
    const body = parseInput(updateProductStatusSchema, req.body, "request body");
    const result = await changeAdminProductStatus({
      productId: getProductId(req),
      status: body.status,
      note: body.note,
    });

    res.status(200).json(result);
  },
);

export const updateAdminProductModerationController = asyncHandler(
  async (req, res) => {
    const body = parseInput(
      updateProductModerationSchema,
      req.body,
      "request body",
    );
    const product = await updateAdminProductModerationFields({
      productId: getProductId(req),
      status: body.status,
      categoryId: body.category_id,
    });

    res.status(200).json({ product });
  },
);
