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
  "Erro interno": "Erro no servidor. Tente novamente em instantes.",
  "Internal Server Error": "Erro no servidor. Tente novamente em instantes.",
};

export function parseApiError(err: unknown, fallback = "Algo deu errado. Tente novamente."): string {
  if (!err) return fallback;

  const raw =
    (err as any)?.data?.message ??
    (err as any)?.message ??
    (err as any)?.error ??
    String(err);

  if (typeof raw !== "string") return fallback;

  for (const [key, friendly] of Object.entries(KNOWN_MESSAGES)) {
    if (raw.includes(key)) return friendly;
  }

  if (raw.length > 0 && raw.length < 200) return raw;

  return fallback;
}
