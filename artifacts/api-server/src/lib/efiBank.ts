import https from "https";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import axios from "axios";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const EFI_BASE_URL = "https://pix.api.efipay.com.br";
const CLIENT_ID = process.env["EFI_CLIENT_ID"] || "";
const CLIENT_SECRET = process.env["EFI_CLIENT_SECRET"] || "";
const PIX_KEY = process.env["EFI_PIX_KEY"] || "";
const CERT_PATH = process.env["EFI_CERT_PATH"] || "./certs/efi.p12";

function createHttpsAgent(): https.Agent {
  const certFullPath = path.isAbsolute(CERT_PATH)
    ? CERT_PATH
    : path.resolve(__dirname, "..", CERT_PATH);

  const pfx = fs.readFileSync(certFullPath);

  return new https.Agent({
    pfx,
    passphrase: "",
    rejectUnauthorized: false,
  });
}

let _agent: https.Agent | null = null;

function getAgent(): https.Agent {
  if (!_agent) {
    _agent = createHttpsAgent();
  }
  return _agent;
}

interface TokenResponse {
  access_token: string;
  token_type: string;
  expires_in: number;
}

let _cachedToken: string | null = null;
let _tokenExpiresAt = 0;

async function getAccessToken(): Promise<string> {
  if (_cachedToken && Date.now() < _tokenExpiresAt) {
    return _cachedToken;
  }

  const agent = getAgent();
  const credentials = Buffer.from(`${CLIENT_ID}:${CLIENT_SECRET}`).toString("base64");

  const response = await axios.post<TokenResponse>(
    `${EFI_BASE_URL}/oauth/token`,
    { grant_type: "client_credentials" },
    {
      httpsAgent: agent,
      headers: {
        Authorization: `Basic ${credentials}`,
        "Content-Type": "application/json",
      },
    }
  );

  _cachedToken = response.data.access_token;
  _tokenExpiresAt = Date.now() + (response.data.expires_in - 60) * 1000;
  return _cachedToken;
}

interface CobResponse {
  txid: string;
  status: string;
  loc: {
    id: number;
    location: string;
    tipoCob: string;
  };
  calendario: { criacao: string; expiracao: number };
  valor: { original: string };
  chave: string;
}

interface QrCodeResponse {
  qrcode: string;
  imagemQrcode: string;
  linkVisualizacao: string;
}

export interface PixChargeResult {
  txid: string;
  qrCodeBase64: string;
  copyPaste: string;
  expiresAt: Date;
}

export async function createPixCharge(
  txid: string,
  amountBRL: number
): Promise<PixChargeResult> {
  const token = await getAccessToken();
  const agent = getAgent();

  const expiracao = 3600;
  const valorStr = amountBRL.toFixed(2);

  const cobPayload = {
    calendario: { expiracao },
    valor: { original: valorStr },
    chave: PIX_KEY,
    solicitacaoPagador: "Recarga de moedas BotAluguel Pro",
  };

  const cobResponse = await axios.put<CobResponse>(
    `${EFI_BASE_URL}/v2/cob/${txid}`,
    cobPayload,
    {
      httpsAgent: agent,
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    }
  );

  const locId = cobResponse.data.loc.id;

  const qrResponse = await axios.get<QrCodeResponse>(
    `${EFI_BASE_URL}/v2/loc/${locId}/qrcode`,
    {
      httpsAgent: agent,
      headers: { Authorization: `Bearer ${token}` },
    }
  );

  return {
    txid,
    qrCodeBase64: qrResponse.data.imagemQrcode,
    copyPaste: qrResponse.data.qrcode,
    expiresAt: new Date(Date.now() + expiracao * 1000),
  };
}

interface CobStatusResponse {
  status: "ATIVA" | "CONCLUIDA" | "REMOVIDA_PELO_USUARIO_RECEBEDOR" | "REMOVIDA_PELO_PSP";
  pix?: Array<{
    endToEndId: string;
    txid: string;
    valor: string;
    horario: string;
  }>;
}

export async function getPixChargeStatus(txid: string): Promise<{
  status: "pending" | "paid" | "expired" | "error";
  paidAt?: Date;
}> {
  try {
    const token = await getAccessToken();
    const agent = getAgent();

    const response = await axios.get<CobStatusResponse>(
      `${EFI_BASE_URL}/v2/cob/${txid}`,
      {
        httpsAgent: agent,
        headers: { Authorization: `Bearer ${token}` },
      }
    );

    const efiStatus = response.data.status;

    if (efiStatus === "CONCLUIDA" && response.data.pix?.length) {
      const pix = response.data.pix[0];
      return { status: "paid", paidAt: new Date(pix!.horario) };
    }

    if (
      efiStatus === "REMOVIDA_PELO_USUARIO_RECEBEDOR" ||
      efiStatus === "REMOVIDA_PELO_PSP"
    ) {
      return { status: "expired" };
    }

    return { status: "pending" };
  } catch {
    return { status: "error" };
  }
}

export interface EfiBankWebhookPayload {
  pix: Array<{
    endToEndId: string;
    txid: string;
    valor: string;
    horario: string;
    gnExtras?: Record<string, unknown>;
  }>;
}

export async function registerWebhook(publicBaseUrl: string): Promise<void> {
  const token = await getAccessToken();
  const agent = getAgent();
  const webhookUrl = `${publicBaseUrl}/api/payments/pix/webhook`;
  const chave = encodeURIComponent(PIX_KEY);

  await axios.put(
    `${EFI_BASE_URL}/v2/webhook/${chave}`,
    { webhookUrl },
    {
      httpsAgent: agent,
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    }
  );
}
