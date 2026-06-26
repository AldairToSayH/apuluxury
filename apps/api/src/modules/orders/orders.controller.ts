import type { NextFunction, Request, RequestHandler, Response } from "express";
import { z, ZodError } from "zod";

import { HttpError } from "../../utils/http-error";
import {
  createOrderForBuyer,
  getAdminOrderDetail,
  getAdminOrders,
  getBuyerOrderDetail,
  getBuyerOrders,
  getSellerOrderDetail,
  getSellerOrders,
  trackPublicOrder,
  updateSellerOrderStatus,
} from "./orders.service";
import {
  adminOrderFiltersSchema,
  buyerOrderFiltersSchema,
  createOrderSchema,
  orderParamsSchema,
  sellerOrderFiltersSchema,
  trackOrderQuerySchema,
  updateSellerOrderStatusSchema,
} from "./orders.schemas";

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

function requireSeller(req: Request) {
  if (!req.seller) {
    throw new HttpError(403, "Seller profile is required");
  }

  return req.seller;
}

function getIdParam(req: Request): string {
  const params = parseInput(orderParamsSchema, req.params, "params");

  return params.id;
}

export const createOrderController = asyncHandler(async (req, res) => {
  const body = parseInput(createOrderSchema, req.body, "request body");
  const order = await createOrderForBuyer(requireUser(req), body);

  res.status(201).json({ order });
});

export const trackOrderController = asyncHandler(async (req, res) => {
  const query = parseInput(trackOrderQuerySchema, req.query, "query");
  const order = await trackPublicOrder(query);

  if (!order) {
    res
      .status(404)
      .json({ error: { message: "No encontramos un pedido con esos datos." } });
    return;
  }

  res.status(200).json({ order });
});

export const listBuyerOrdersController = asyncHandler(async (req, res) => {
  const filters = parseInput(buyerOrderFiltersSchema, req.query, "query");
  const orders = await getBuyerOrders(requireUser(req), filters);

  res.status(200).json({ orders });
});

export const getBuyerOrderController = asyncHandler(async (req, res) => {
  const order = await getBuyerOrderDetail(requireUser(req), getIdParam(req));

  res.status(200).json({ order });
});

export const listSellerOrdersController = asyncHandler(async (req, res) => {
  const filters = parseInput(sellerOrderFiltersSchema, req.query, "query");
  const sellerOrders = await getSellerOrders(requireSeller(req), filters);

  res.status(200).json({ sellerOrders });
});

export const getSellerOrderController = asyncHandler(async (req, res) => {
  const sellerOrder = await getSellerOrderDetail(
    requireSeller(req),
    getIdParam(req),
  );

  res.status(200).json({ sellerOrder });
});

export const updateSellerOrderStatusController = asyncHandler(
  async (req, res) => {
    const body = parseInput(
      updateSellerOrderStatusSchema,
      req.body,
      "request body",
    );
    const sellerOrder = await updateSellerOrderStatus(
      requireUser(req),
      requireSeller(req),
      getIdParam(req),
      body,
    );

    res.status(200).json({ sellerOrder });
  },
);

export const listAdminOrdersController = asyncHandler(async (req, res) => {
  const filters = parseInput(adminOrderFiltersSchema, req.query, "query");
  const orders = await getAdminOrders(filters);

  res.status(200).json({ orders });
});

export const getAdminOrderController = asyncHandler(async (req, res) => {
  const order = await getAdminOrderDetail(getIdParam(req));

  res.status(200).json({ order });
});
