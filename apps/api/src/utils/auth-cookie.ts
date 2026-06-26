import type { Request, Response } from "express";

import { env } from "../config/env";

const AUTH_COOKIE_NAME = "apu_luxury_token";
const SEVEN_DAYS_IN_MS = 7 * 24 * 60 * 60 * 1000;

function isProduction() {
  return env.NODE_ENV === "production";
}

export function setAuthCookie(res: Response, token: string): void {
  res.cookie(AUTH_COOKIE_NAME, token, {
    httpOnly: true,
    maxAge: SEVEN_DAYS_IN_MS,
    path: "/",
    sameSite: isProduction() ? "none" : "lax",
    secure: isProduction(),
  });
}

export function clearAuthCookie(res: Response): void {
  res.clearCookie(AUTH_COOKIE_NAME, {
    path: "/",
    sameSite: isProduction() ? "none" : "lax",
    secure: isProduction(),
  });
}

export function getAuthCookie(req: Request): string | null {
  const token = req.cookies?.[AUTH_COOKIE_NAME];

  return typeof token === "string" && token.trim() ? token : null;
}
