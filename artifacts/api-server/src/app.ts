import express, { type Express } from "express";
import cors from "cors";
import pinoHttp from "pino-http";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";
import router from "./routes";
import { logger } from "./lib/logger";
import { globalLimiter } from "./lib/rateLimiter";

const app: Express = express();

app.set("trust proxy", 1);

app.use(
  pinoHttp({
    logger,
    serializers: {
      req(req) {
        return {
          id: req.id,
          method: req.method,
          url: req.url?.split("?")[0],
        };
      },
      res(res) {
        return {
          statusCode: res.statusCode,
        };
      },
    },
  }),
);
const REPLIT_DEV_DOMAIN = process.env["REPLIT_DEV_DOMAIN"];
const REPLIT_EXPO_DEV_DOMAIN = process.env["REPLIT_EXPO_DEV_DOMAIN"];
const APP_PUBLIC_URL = process.env["APP_PUBLIC_URL"];
const defaultOrigins: string[] = [];
if (REPLIT_DEV_DOMAIN) {
  defaultOrigins.push(`https://${REPLIT_DEV_DOMAIN}`);
}
if (REPLIT_EXPO_DEV_DOMAIN) {
  defaultOrigins.push(`https://${REPLIT_EXPO_DEV_DOMAIN}`);
}
if (APP_PUBLIC_URL) {
  const normalized = APP_PUBLIC_URL.replace(/\/+$/, "");
  if (!defaultOrigins.includes(normalized)) {
    defaultOrigins.push(normalized);
  }
}

const allowedOrigins = process.env["CORS_ORIGINS"]
  ? process.env["CORS_ORIGINS"].split(",").map(o => o.trim())
  : defaultOrigins.length > 0
    ? defaultOrigins
    : null;

if (!allowedOrigins) {
  if (process.env["NODE_ENV"] === "production") {
    throw new Error("CORS_ORIGINS environment variable is required in production. Set it to a comma-separated list of allowed origins.");
  }
  logger.warn("CORS_ORIGINS and REPLIT_DEV_DOMAIN not set — CORS is unrestricted in development. Set CORS_ORIGINS for stricter control.");
}

// Only enforce strict CORS when CORS_ORIGINS is explicitly set.
// The API uses JWT (not cookies) so CSRF via CORS doesn't apply.
// Native mobile apps don't send Origin at all, so restricting origins breaks them.
const strictCorsOrigins = process.env["CORS_ORIGINS"]
  ? process.env["CORS_ORIGINS"].split(",").map(o => o.trim())
  : null;

app.use(cors({
  origin: (origin, callback) => {
    if (!origin) {
      // Native apps, server-to-server: always allow
      callback(null, true);
      return;
    }
    if (strictCorsOrigins && !strictCorsOrigins.includes(origin)) {
      logger.warn({ origin, strictCorsOrigins }, "CORS blocked request from unknown origin");
      callback(new Error("Not allowed by CORS"));
      return;
    }
    callback(null, true);
  },
  credentials: true,
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/api", globalLimiter, router);

// Serve the web frontend in production (when the built files exist).
// Falls back gracefully in development where Vite serves the SPA.
// Path from: artifacts/api-server/dist/index.mjs → ../../bot-aluguel-pro/dist/public
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const frontendDist = path.resolve(__dirname, "../../bot-aluguel-pro/dist/public");
if (fs.existsSync(frontendDist)) {
  app.use(express.static(frontendDist));
  // SPA fallback: serve index.html for any route not matched above (e.g., /login, /dashboard)
  app.use((_req, res) => {
    res.sendFile(path.join(frontendDist, "index.html"));
  });
  logger.info({ frontendDist }, "Serving built web frontend");
}

export default app;
