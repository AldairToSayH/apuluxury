import cors from "cors";
import cookieParser from "cookie-parser";
import express from "express";
import helmet from "helmet";
import passport from "passport";

import "./config/passport";
import { env } from "./config/env";
import { errorMiddleware } from "./middlewares/error.middleware";
import { notFoundMiddleware } from "./middlewares/not-found.middleware";
import { requestLoggerMiddleware } from "./middlewares/request-logger.middleware";
import { healthRouter } from "./modules/health/health.routes";
import { apiRouter } from "./routes";

export const app = express();
const allowedOrigins = Array.from(
  new Set(
    [env.FRONTEND_URL, ...env.CORS_ORIGIN.split(",")]
      .map((origin) => origin.trim())
      .filter(Boolean),
  ),
);

app.use(helmet());
app.use(
  cors({
    origin(origin, callback) {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
        return;
      }

      callback(new Error("Not allowed by CORS"));
    },
    credentials: true,
  }),
);
app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(passport.initialize());
app.use(requestLoggerMiddleware);

app.use("/health", healthRouter);
app.use("/api", apiRouter);

app.use(notFoundMiddleware);
app.use(errorMiddleware);
