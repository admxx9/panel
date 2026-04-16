import express, { type Express } from "express";
import cors from "cors";
import pinoHttp from "pino-http";
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
const defaultOrigins: string[] = [];
if (REPLIT_DEV_DOMAIN) {
  defaultOrigins.push(`https://${REPLIT_DEV_DOMAIN}`);
}
if (REPLIT_EXPO_DEV_DOMAIN) {
  defaultOrigins.push(`https://${REPLIT_EXPO_DEV_DOMAIN}`);
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

app.use(cors(allowedOrigins ? {
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      logger.warn({ origin, allowedOrigins }, "CORS blocked request from unknown origin");
      callback(new Error("Not allowed by CORS"));
    }
  },
  credentials: true,
} : { credentials: true }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/api", globalLimiter, router);

export default app;
