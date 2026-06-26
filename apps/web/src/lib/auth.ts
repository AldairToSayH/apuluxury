"use client";

import { ApiError, COOKIE_SESSION_TOKEN, apiClient } from "@/lib/apiClient";
import { dashboardForRole } from "@/lib/routes";
import type { ApiUser, MeResponse } from "@/types/api";

const TOKEN_KEY = "apu_luxury_token";
const AUTH_EVENT = "apu_luxury_auth_changed";

export function saveToken(token: string) {
  window.localStorage.setItem(TOKEN_KEY, token);
  window.dispatchEvent(new Event(AUTH_EVENT));
}

export function getToken() {
  if (typeof window === "undefined") {
    return null;
  }

  return window.localStorage.getItem(TOKEN_KEY) ?? COOKIE_SESSION_TOKEN;
}

export function removeToken() {
  window.localStorage.removeItem(TOKEN_KEY);
  window.dispatchEvent(new Event(AUTH_EVENT));
}

export async function getCurrentUser() {
  const token = getToken();

  try {
    return await apiClient<MeResponse>("/api/auth/me", { token });
  } catch (error) {
    if (error instanceof ApiError && error.status === 401) {
      return null;
    }

    throw error;
  }
}

export async function logout() {
  const token = getToken();

  try {
    await apiClient<{ message: string }>("/api/auth/logout", {
      method: "POST",
      token,
    });
  } catch {
    // Local cleanup still needs to happen if the server session is already gone.
  }

  removeToken();
  window.location.href = "/";
}

export function redirectPathForUser(user: ApiUser) {
  return dashboardForRole(user.role);
}

export function onAuthChange(listener: () => void) {
  window.addEventListener(AUTH_EVENT, listener);
  window.addEventListener("storage", listener);

  return () => {
    window.removeEventListener(AUTH_EVENT, listener);
    window.removeEventListener("storage", listener);
  };
}
