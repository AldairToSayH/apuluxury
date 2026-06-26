import type { NextFunction, Request, RequestHandler, Response } from "express";
import passport from "passport";
import { ZodError, type ZodSchema } from "zod";

import { env } from "../../config/env";
import {
  isGoogleOAuthEnabled,
  type GoogleOAuthUser,
} from "../../config/passport";
import { clearAuthCookie, setAuthCookie } from "../../utils/auth-cookie";
import { HttpError } from "../../utils/http-error";
import {
  getCurrentUser,
  login,
  loginWithGoogle,
  registerBuyer,
  registerSeller,
} from "./auth.service";
import {
  loginSchema,
  registerBuyerSchema,
  registerSellerSchema,
} from "./auth.schemas";

function parseBody<T>(schema: ZodSchema<T>, body: unknown): T {
  try {
    return schema.parse(body);
  } catch (error) {
    if (error instanceof ZodError) {
      const details = error.issues
        .map((issue) => `${issue.path.join(".")}: ${issue.message}`)
        .join("; ");

      throw new HttpError(400, `Invalid request body: ${details}`);
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

export const registerBuyerController = asyncHandler(async (req, res) => {
  const body = parseBody(registerBuyerSchema, req.body);
  const result = await registerBuyer(body);

  setAuthCookie(res, result.token);
  res.status(201).json(result);
});

export const registerSellerController = asyncHandler(async (req, res) => {
  const body = parseBody(registerSellerSchema, req.body);
  const result = await registerSeller(body);

  setAuthCookie(res, result.token);
  res.status(201).json(result);
});

export const loginController = asyncHandler(async (req, res) => {
  const body = parseBody(loginSchema, req.body);
  const result = await login(body);

  setAuthCookie(res, result.token);
  res.status(200).json(result);
});

export const ensureGoogleOAuthConfigured: RequestHandler = (_req, _res, next) => {
  if (!isGoogleOAuthEnabled) {
    next(new HttpError(503, "Google OAuth is not configured"));
    return;
  }

  next();
};

function redirectPathForRole(role: "buyer" | "seller" | "admin") {
  if (role === "buyer") {
    return "/comprador";
  }

  if (role === "seller") {
    return "/vendedor";
  }

  return "/admin";
}

export const googleCallbackController: RequestHandler = (req, res, next) => {
  passport.authenticate(
    "google",
    { session: false },
    (
      error: Error | null,
      googleUser: GoogleOAuthUser | false | undefined,
    ) => {
      if (error) {
        next(error);
        return;
      }

      if (!googleUser) {
        next(new HttpError(401, "Google authentication failed"));
        return;
      }

      loginWithGoogle(googleUser)
        .then((result) => {
          setAuthCookie(res, result.token);
          res.redirect(
            `${env.FRONTEND_URL}${redirectPathForRole(result.user.role)}`,
          );
        })
        .catch(next);
    },
  )(req, res, next);
};

export const meController = asyncHandler(async (req, res) => {
  if (!req.user) {
    throw new HttpError(401, "Authentication is required");
  }

  const result = await getCurrentUser(req.user.id);

  res.status(200).json(result);
});

export const logoutController = asyncHandler(async (_req, res) => {
  clearAuthCookie(res);

  res.status(200).json({ message: "Sesion cerrada correctamente" });
});
