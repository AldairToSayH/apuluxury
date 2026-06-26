import type { NextFunction, Request, RequestHandler, Response } from "express";
import { z, ZodError } from "zod";

import { HttpError } from "../../utils/http-error";
import {
  addItemToMyCart,
  clearMyCart,
  deleteMyCartItem,
  getMyCart,
  updateMyCartItem,
} from "./cart.service";
import {
  addCartItemSchema,
  cartItemParamsSchema,
  updateCartItemSchema,
} from "./cart.schemas";

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

function requireUser(req: Request) {
  if (!req.user) {
    throw new HttpError(401, "Authentication is required");
  }

  return req.user;
}

function getCartItemId(req: Request): string {
  const params = parseInput(cartItemParamsSchema, req.params, "params");

  return params.id;
}

export const getCartController = asyncHandler(async (req, res) => {
  const cart = await getMyCart(requireUser(req));

  res.status(200).json({ cart });
});

export const addCartItemController = asyncHandler(async (req, res) => {
  const body = parseInput(addCartItemSchema, req.body, "request body");
  const cart = await addItemToMyCart(requireUser(req), body);

  res.status(200).json({ cart });
});

export const updateCartItemController = asyncHandler(async (req, res) => {
  const body = parseInput(updateCartItemSchema, req.body, "request body");
  const cart = await updateMyCartItem(requireUser(req), getCartItemId(req), body);

  res.status(200).json({ cart });
});

export const deleteCartItemController = asyncHandler(async (req, res) => {
  const cart = await deleteMyCartItem(requireUser(req), getCartItemId(req));

  res.status(200).json({ cart });
});

export const clearCartController = asyncHandler(async (req, res) => {
  const cart = await clearMyCart(requireUser(req));

  res.status(200).json({ cart });
});
