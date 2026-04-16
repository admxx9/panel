import { logger } from "./logger.js";
import admin from "firebase-admin";

let firebaseInitialized = false;

function initFirebase() {
  if (firebaseInitialized) return;
  const raw = process.env.FIREBASE_SERVICE_ACCOUNT_JSON;
  if (!raw) {
    logger.warn("FIREBASE_SERVICE_ACCOUNT_JSON not set — FCM push disabled");
    return;
  }
  try {
    const serviceAccount = JSON.parse(raw);
    admin.initializeApp({ credential: admin.credential.cert(serviceAccount) });
    firebaseInitialized = true;
    logger.info("Firebase Admin SDK initialized for FCM v1");
  } catch (err) {
    logger.warn({ err }, "Failed to initialize Firebase Admin SDK");
  }
}

initFirebase();

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
  const fcmMessages = messages.filter(
    (m) => typeof m.to === "string" && !m.to.startsWith("ExponentPushToken[")
  );
  const expoMessages = messages.filter(
    (m) => typeof m.to === "string" && m.to.startsWith("ExponentPushToken[")
  );

  if (fcmMessages.length > 0) {
    await sendViaFirebase(fcmMessages);
  }

  if (expoMessages.length > 0) {
    await sendViaExpo(expoMessages);
  }
}

async function sendViaFirebase(messages: ExpoPushMessage[]): Promise<void> {
  if (!firebaseInitialized) {
    logger.warn("Firebase not initialized, skipping FCM push");
    return;
  }
  for (const msg of messages) {
    try {
      await admin.messaging().send({
        token: msg.to,
        notification: { title: msg.title, body: msg.body },
        android: {
          notification: {
            sound: "default",
            channelId: msg.channelId ?? "default",
          },
        },
        data: msg.data ?? {},
      });
      logger.info({ token: msg.to.slice(0, 20) }, "FCM push sent via Firebase");
    } catch (err) {
      logger.warn({ err, token: msg.to.slice(0, 20) }, "FCM push failed (non-fatal)");
    }
  }
}

async function sendViaExpo(messages: ExpoPushMessage[]): Promise<void> {
  try {
    const res = await fetch("https://exp.host/--/api/v2/push/send", {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Accept-Encoding": "gzip, deflate",
        "Content-Type": "application/json",
      },
      body: JSON.stringify(messages.length === 1 ? messages[0] : messages),
    });
    if (!res.ok) {
      const text = await res.text();
      logger.warn({ status: res.status, body: text }, "Expo push request failed (non-fatal)");
    }
  } catch (err) {
    logger.warn({ err }, "Expo push send error (non-fatal)");
  }
}
