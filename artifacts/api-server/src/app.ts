import express, { type Express } from "express";
import cors from "cors";
import pinoHttp from "pino-http";
import router from "./routes";
import { logger } from "./lib/logger";
import { globalLimiter } from "./lib/rateLimiter";

const app: Express = express();

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
const defaultOrigins: string[] = [];
if (REPLIT_DEV_DOMAIN) {
  defaultOrigins.push(`https://${REPLIT_DEV_DOMAIN}`);
}

const allowedOrigins = process.env["CORS_ORIGINS"]
  ? process.env["CORS_ORIGINS"].split(",").map(o => o.trim())
  : defaultOrigins.length > 0
    ? defaultOrigins
    : null;

if (!allowedOrigins && process.env["NODE_ENV"] === "production") {
  logger.error("CORS_ORIGINS not set in production — CORS is unrestricted. Set CORS_ORIGINS to restrict allowed origins.");
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
