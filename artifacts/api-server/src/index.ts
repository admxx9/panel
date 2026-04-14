import http from "http";
import app from "./app";
import { logger } from "./lib/logger";
import { restoreSessions } from "./lib/whatsapp.js";
import { setupTerminalWs } from "./lib/terminalWs.js";
import { registerWebhook } from "./lib/efiBank.js";

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
