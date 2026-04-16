import http from "http";
import app from "./app";
import { logger } from "./lib/logger";
import { restoreSessions } from "./lib/whatsapp.js";
import { setupTerminalWs } from "./lib/terminalWs.js";
import { registerWebhook } from "./lib/efiBank.js";
import { db } from "@workspace/db";
import { users as usersTable } from "@workspace/db";
import { eq } from "drizzle-orm";

const rawPort = process.env["PORT"];

if (!rawPort) {
  throw new Error(
    "PORT environment variable is required but was not provided.",
  );
}

const port = Number(rawPort);

if (Number.isNaN(port) || port <= 0) {
  throw new Error(`Invalid PORT value: "${rawPort}"`);
}

const server = http.createServer(app);

setupTerminalWs(server);

server.listen(port, () => {
  logger.info({ port }, "Server listening");

  setTimeout(() => {
    restoreSessions().catch((err) => {
      logger.error({ err }, "Failed to restore sessions on startup");
    });
  }, 3000);

  // Auto-promote admin user on startup if ADMIN_PHONE is set
  const adminPhone = process.env["ADMIN_PHONE"];
  if (adminPhone) {
    db.update(usersTable)
      .set({ isAdmin: true })
      .where(eq(usersTable.phone, adminPhone))
      .then((result) => {
        logger.info({ phone: adminPhone, rows: result.rowCount }, "Admin phone promotion applied");
      })
      .catch((err) => {
        logger.warn({ err }, "Admin phone promotion failed (non-fatal)");
      });
  }

  const replitDomains = process.env["REPLIT_DOMAINS"];
  const appUrl = process.env["APP_PUBLIC_URL"] ?? (replitDomains ? `https://${replitDomains}` : null);
  if (appUrl) {
    registerWebhook(appUrl)
      .then(() => logger.info({ appUrl }, "EFI Bank webhook registered"))
      .catch((err) => logger.warn({ err }, "EFI Bank webhook registration failed (non-fatal)"));
  } else {
    logger.warn("APP_PUBLIC_URL not set — EFI Bank webhook not registered");
  }
});

server.on("error", (err) => {
  logger.error({ err }, "Error listening on port");
  process.exit(1);
});
