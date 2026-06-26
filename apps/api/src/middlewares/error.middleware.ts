import type { ErrorRequestHandler } from "express";

import { env } from "../config/env";

export const errorMiddleware: ErrorRequestHandler = (error, _req, res, _next) => {
  const statusCode =
    typeof error.statusCode === "number" && error.statusCode >= 400
      ? error.statusCode
      : 500;

  const message =
    error instanceof Error ? error.message : "Unexpected server error";

  res.status(statusCode).json({
    error: {
      message: statusCode === 500 ? "Internal server error" : message,
      ...(env.NODE_ENV === "development" && {
        details: message,
        stack: error instanceof Error ? error.stack : undefined,
      }),
    },
  });
};
