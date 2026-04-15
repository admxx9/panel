import rateLimit from "express-rate-limit";

const rateLimitMessage = {
  message: "Muitas requisições. Tente novamente em alguns minutos.",
};

export const globalLimiter = rateLimit({
  windowMs: 60 * 1000,
  limit: 100,
  standardHeaders: "draft-7",
  legacyHeaders: false,
  message: rateLimitMessage,
});

export const authLimiter = rateLimit({
  windowMs: 60 * 1000,
  limit: 5,
  standardHeaders: "draft-7",
  legacyHeaders: false,
  message: {
    message: "Muitas tentativas de login. Aguarde 1 minuto antes de tentar novamente.",
  },
});

export const smsLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  limit: 3,
  standardHeaders: "draft-7",
  legacyHeaders: false,
  keyGenerator: (req) => {
    const phone = (req.body as { phone?: string })?.phone;
    return `sms:${phone ? phone.replace(/\D/g, "") : "no-phone"}`;
  },
  validate: false,
  message: {
    message: "Limite de envio de SMS atingido. Tente novamente em 1 hora.",
  },
});

export const createResourceLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  limit: 10,
  standardHeaders: "draft-7",
  legacyHeaders: false,
  message: {
    message: "Limite de criação atingido. Tente novamente em 1 hora.",
  },
});
