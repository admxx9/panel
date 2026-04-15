import axios, { AxiosError } from "axios";

const ZENVIA_API_URL = "https://api.zenvia.com/v2/channels/sms/messages";
const ZENVIA_SENDER_ID = process.env.SMS_SENDER_ID ?? "BotAluguel";

export interface SmsSendResult {
  ok: boolean;
  provider: "zenvia" | "mock";
  error?: string;
}

function formatE164(phone: string): string {
  const digits = phone.replace(/\D/g, "");
  if (digits.startsWith("55") && digits.length >= 12) return `+${digits}`;
  if (digits.length === 11 || digits.length === 10) return `+55${digits}`;
  return `+${digits}`;
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
  logger?: { info: (obj: object, msg: string) => void; warn: (obj: object, msg: string) => void; error: (obj: object, msg: string) => void }
): Promise<SmsSendResult> {
  const apiKey = process.env.SMS_API_KEY;

  if (!apiKey) {
    logger?.info({ phone, text }, "[SMS mock] SMS_API_KEY not set — logging code instead of sending");
    return { ok: true, provider: "mock" };
  }

  try {
    await sendViaZenvia(phone, text, apiKey);
    logger?.info({ phone }, "SMS sent via Zenvia");
    return { ok: true, provider: "zenvia" };
  } catch (err) {
    let detail = "unknown error";
    if (err instanceof AxiosError) {
      detail = err.response?.data
        ? JSON.stringify(err.response.data).slice(0, 200)
        : err.message;
    } else if (err instanceof Error) {
      detail = err.message;
    }
    logger?.error({ phone, detail }, "Failed to send SMS via Zenvia");
    return { ok: false, provider: "zenvia", error: detail };
  }
}
