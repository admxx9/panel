type ApiErrorShape = {
  data?: { message?: unknown };
  message?: unknown;
  error?: unknown;
};

function isApiErrorShape(err: unknown): err is ApiErrorShape {
  return typeof err === "object" && err !== null;
}

const KNOWN_MESSAGES: Record<string, string> = {
  "Failed to fetch": "Sem conexão com o servidor. Verifique sua internet.",
  "Network request failed": "Sem conexão com o servidor. Verifique sua internet.",
  "Telefone ou senha incorretos": "Telefone ou senha incorretos.",
  "Telefone já cadastrado": "Este telefone já está cadastrado.",
  "Nome, telefone e senha são obrigatórios": "Preencha todos os campos obrigatórios.",
  "Telefone e senha são obrigatórios": "Preencha o telefone e a senha.",
  "Token inválido": "Sessão expirada. Faça login novamente.",
  "Não autorizado": "Sessão expirada. Faça login novamente.",
  "Unauthorized": "Sessão expirada. Faça login novamente.",
  "Limite de bots": "Você atingiu o limite de bots do seu plano.",
  "Moedas insuficientes": "Saldo de moedas insuficiente para esta operação.",
  "Plano não encontrado": "Plano não encontrado. Recarregue a página.",
  "Erro interno": "Erro no servidor. Tente novamente em instantes.",
  "Internal Server Error": "Erro no servidor. Tente novamente em instantes.",
};

export function parseApiError(err: unknown, fallback = "Algo deu errado. Tente novamente."): string {
  if (!err) return fallback;

  let raw: string | undefined;

  if (isApiErrorShape(err)) {
    const dataMsg = err.data?.message;
    const errMsg = err.message;
    const errError = err.error;
    if (typeof dataMsg === "string") raw = dataMsg;
    else if (typeof errMsg === "string") raw = errMsg;
    else if (typeof errError === "string") raw = errError;
  } else if (typeof err === "string") {
    raw = err;
  }

  if (!raw) return fallback;

  for (const [key, friendly] of Object.entries(KNOWN_MESSAGES)) {
    if (raw.includes(key)) return friendly;
  }

  if (raw.length > 0 && raw.length < 200) return raw;

  return fallback;
}

export type FieldErrors<T extends string> = Partial<Record<T, string>>;

const PHONE_KEYWORDS = ["telefone", "phone", "número", "numero"];
const PASSWORD_KEYWORDS = ["senha", "password", "credencial"];
const NAME_KEYWORDS = ["nome", "name"];
const DUPLICATE_KEYWORDS = ["cadastrado", "já existe", "already", "duplicate", "exists"];

export function parseLoginFieldErrors(err: unknown): FieldErrors<"phone" | "password"> {
  const msg = parseApiError(err, "").toLowerCase();
  if (!msg) return { password: parseApiError(err) };

  const isPhone = PHONE_KEYWORDS.some((k) => msg.includes(k) && !msg.includes("senha"));
  const isPass = PASSWORD_KEYWORDS.some((k) => msg.includes(k));

  if (isPhone && !isPass) return { phone: parseApiError(err) };
  if (isPass && !isPhone) return { password: parseApiError(err) };
  return { password: parseApiError(err) };
}

export type RegisterField = "name" | "phone" | "password" | "confirmPassword";

export function parseRegisterFieldErrors(err: unknown): FieldErrors<RegisterField> {
  const friendly = parseApiError(err);
  const msg = friendly.toLowerCase();

  const isPhone = PHONE_KEYWORDS.some((k) => msg.includes(k));
  const isPass = PASSWORD_KEYWORDS.some((k) => msg.includes(k));
  const isName = NAME_KEYWORDS.some((k) => msg.includes(k));
  const isDuplicate = DUPLICATE_KEYWORDS.some((k) => msg.includes(k));

  if (isDuplicate && isPhone) return { phone: friendly };
  if (isName && !isPhone && !isPass) return { name: friendly };
  if (isPhone && !isPass) return { phone: friendly };
  if (isPass) return { password: friendly };
  return { phone: friendly };
}
