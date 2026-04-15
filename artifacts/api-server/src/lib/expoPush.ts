import { logger } from "./logger.js";

export interface ExpoPushMessage {
  to: string;
  title: string;
  body: string;
  data?: Record<string, string>;
  sound?: "default";
  badge?: number;
  channelId?: string;
}

export async function sendExpoPush(messages: ExpoPushMessage[]): Promise<void> {
  const valid = messages.filter(
    (m) => typeof m.to === "string" && m.to.startsWith("ExponentPushToken[")
  );
  if (valid.length === 0) return;

  try {
    const res = await fetch("https://exp.host/--/api/v2/push/send", {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Accept-Encoding": "gzip, deflate",
        "Content-Type": "application/json",
      },
      body: JSON.stringify(valid.length === 1 ? valid[0] : valid),
    });
    if (!res.ok) {
      const text = await res.text();
      logger.warn({ status: res.status, body: text }, "Expo push request failed (non-fatal)");
    }
  } catch (err) {
    logger.warn({ err }, "Expo push send error (non-fatal)");
  }
}
