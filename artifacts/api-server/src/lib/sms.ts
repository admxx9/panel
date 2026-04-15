import axios, { AxiosError } from "axios";

const ZENVIA_API_URL = "https://api.zenvia.com/v2/channels/sms/messages";
const ZENVIA_SENDER_ID = process.env.SMS_SENDER_ID ?? "BotAluguel";

const MAX_ATTEMPTS = 3;
const BASE_DELAY_MS = 500;

export interface SmsSendResult {
  ok: boolean;
  provider: "zenvia" | "mock";
  attempts?: number;
  error?: string;
}

type SmsLogger = {
  info: (obj: object, msg: string) => void;
  warn: (obj: object, msg: string) => void;
  error: (obj: object, msg: string) => void;
};

function formatE164(phone: string): string {
  const digits = phone.replace(/\D/g, "");
  if (digits.startsWith("55") && digits.length >= 12) return `+${digits}`;
  if (digits.length === 11 || digits.length === 10) return `+55${digits}`;
  return `+${digits}`;
}

function isRetryable(err: unknown): boolean {
  if (err instanceof AxiosError) {
    if (!err.response) return true;
    const status = err.response.status;
    return status === 429 || status === 503 || status >= 500;
  }
  return false;
}

function extractDetail(err: unknown): string {
  if (err instanceof AxiosError) {
    if (err.response?.data) {
      return JSON.stringify(err.response.data).slice(0, 200);
    }
    return err.message;
  }
  if (err instanceof Error) return err.message;
  return "unknown error";
}

async function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function sendViaZenvia(to: string, text: string, apiKey: string): Promise<void> {
  await axios.post(
    ZENVIA_API_URL,
    {
      from: ZENVIA_SENDER_ID,
      to: { number: formatE164(to) },
      contents: [{ type: "text", text }],
    },
    {
      headers: {
        "X-API-TOKEN": apiKey,
        "Content-Type": "application/json",
      },
      timeout: 10_000,
    }
  );
}

export async function sendSms(
  phone: string,
  text: string,
  logger?: SmsLogger
): Promise<SmsSendResult> {
  const apiKey = process.env.SMS_API_KEY;

  if (!apiKey) {
    logger?.info(
      { phone, mock: true },
      "[SMS mock] SMS_API_KEY not set — SMS would be sent in production"
    );
    return { ok: true, provider: "mock" };
  }

  let lastError = "";
  for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {
    try {
      await sendViaZenvia(phone, text, apiKey);
      logger?.info({ phone, provider: "zenvia", attempt }, "SMS sent successfully");
      return { ok: true, provider: "zenvia", attempts: attempt };
    } catch (err) {
      lastError = extractDetail(err);
      const retryable = isRetryable(err);

      if (!retryable || attempt === MAX_ATTEMPTS) {
        logger?.error(
          { phone, detail: lastError, attempt, retryable },
          "Failed to send SMS via Zenvia"
        );
        break;
      }

      const delay = BASE_DELAY_MS * 2 ** (attempt - 1);
      logger?.warn(
        { phone, attempt, delay, detail: lastError },
        "SMS send failed, retrying..."
      );
      await sleep(delay);
    }
  }

  return { ok: false, provider: "zenvia", attempts: MAX_ATTEMPTS, error: lastError };
}
