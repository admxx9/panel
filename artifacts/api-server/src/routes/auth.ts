import { Router } from "express";
import { v4 as uuidv4 } from "uuid";
import { db, usersTable, botsTable, botCommandsTable, activePlansTable, paymentsTable, notificationsTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import { hashPassword, verifyPassword, signToken, requireAuth, type AuthRequest } from "../lib/auth.js";
import { sendSms } from "../lib/sms.js";

const router = Router();

router.post("/login", async (req, res) => {
  try {
    const { phone, password } = req.body as { phone?: string; password?: string };
    if (!phone || !password) {
      res.status(400).json({ message: "Telefone e senha são obrigatórios" });
      return;
    }

    const cleanPhone = phone.replace(/\D/g, "");
    const [user] = await db.select().from(usersTable).where(eq(usersTable.phone, cleanPhone));

    if (!user || !verifyPassword(password, user.passwordHash)) {
      res.status(401).json({ message: "Telefone ou senha incorretos" });
      return;
    }

    const token = signToken({ userId: user.id, isAdmin: user.isAdmin });
    res.json({
      token,
      user: {
        id: user.id,
        name: user.name,
        phone: user.phone,
        coins: user.coins,
        isAdmin: user.isAdmin,
        createdAt: user.createdAt,
      },
    });
  } catch (err) {
    req.log.error({ err }, "Login error");
    res.status(500).json({ message: "Erro interno" });
  }
});

router.post("/register", async (req, res) => {
  try {
    const { name, phone, password } = req.body as { name?: string; phone?: string; password?: string };
    if (!name || !phone || !password) {
      res.status(400).json({ message: "Nome, telefone e senha são obrigatórios" });
      return;
    }

    const cleanPhone = phone.replace(/\D/g, "");
    const [existing] = await db.select().from(usersTable).where(eq(usersTable.phone, cleanPhone));

    if (existing) {
      res.status(400).json({ message: "Telefone já cadastrado" });
      return;
    }

    const id = uuidv4();
    const passwordHash = hashPassword(password);

    const [user] = await db
      .insert(usersTable)
      .values({ id, name, phone: cleanPhone, passwordHash, coins: 30, isAdmin: false })
      .returning();

    const token = signToken({ userId: user.id, isAdmin: user.isAdmin });
    res.status(201).json({
      token,
      user: {
        id: user.id,
        name: user.name,
        phone: user.phone,
        coins: user.coins,
        isAdmin: user.isAdmin,
        createdAt: user.createdAt,
      },
    });
  } catch (err) {
    req.log.error({ err }, "Register error");
    res.status(500).json({ message: "Erro interno" });
  }
});

router.get("/me", requireAuth, async (req: AuthRequest, res) => {
  try {
    const [user] = await db.select().from(usersTable).where(eq(usersTable.id, req.userId!));
    if (!user) {
      res.status(404).json({ message: "Usuário não encontrado" });
      return;
    }
    res.json({
      id: user.id,
      name: user.name,
      phone: user.phone,
      coins: user.coins,
      isAdmin: user.isAdmin,
      createdAt: user.createdAt,
    });
  } catch (err) {
    req.log.error({ err }, "GetMe error");
    res.status(500).json({ message: "Erro interno" });
  }
});

router.patch("/profile", requireAuth, async (req: AuthRequest, res) => {
  try {
    const { name, phone, expoPushToken } = req.body as { name?: string; phone?: string; expoPushToken?: string | null };
    const updates: Record<string, string | null> = {};
    if (name && name.trim()) updates.name = name.trim();
    if (phone && phone.trim()) {
      const cleanPhone = phone.replace(/\D/g, "");
      const [existing] = await db.select().from(usersTable).where(eq(usersTable.phone, cleanPhone));
      if (existing && existing.id !== req.userId) {
        res.status(400).json({ message: "Telefone já cadastrado por outro usuário" });
        return;
      }
      updates.phone = cleanPhone;
    }
    if (expoPushToken !== undefined) {
      if (expoPushToken === null || expoPushToken === "") {
        updates.expoPushToken = null;
      } else if (expoPushToken.startsWith("ExponentPushToken[")) {
        updates.expoPushToken = expoPushToken;
      }
    }
    if (Object.keys(updates).length === 0) {
      res.status(400).json({ message: "Nenhum campo para atualizar" });
      return;
    }
    const [user] = await db.update(usersTable).set(updates).where(eq(usersTable.id, req.userId!)).returning();
    res.json({
      id: user.id,
      name: user.name,
      phone: user.phone,
      coins: user.coins,
      isAdmin: user.isAdmin,
      createdAt: user.createdAt,
    });
  } catch (err) {
    req.log.error({ err }, "UpdateProfile error");
    res.status(500).json({ message: "Erro interno" });
  }
});

const resetCodes = new Map<string, { code: string; expiresAt: number }>();

router.post("/reset-password/request", async (req, res) => {
  try {
    const { phone } = req.body as { phone?: string };
    if (!phone) {
      res.status(400).json({ message: "Telefone é obrigatório" });
      return;
    }
    const cleanPhone = phone.replace(/\D/g, "");
    const [user] = await db.select().from(usersTable).where(eq(usersTable.phone, cleanPhone));
    if (!user) {
      res.status(404).json({ message: "Nenhuma conta encontrada com esse telefone" });
      return;
    }
    const code = String(Math.floor(100000 + Math.random() * 900000));
    resetCodes.set(cleanPhone, { code, expiresAt: Date.now() + 10 * 60 * 1000 });

    const smsText = `BotAluguel Pro: seu código de verificação é ${code}. Válido por 10 minutos. Não compartilhe.`;
    const result = await sendSms(cleanPhone, smsText, req.log);

    if (!result.ok) {
      resetCodes.delete(cleanPhone);
      res.status(503).json({ message: "Não foi possível enviar o SMS. Tente novamente em instantes." });
      return;
    }

    res.json({ message: "Código de verificação enviado por SMS" });
  } catch (err) {
    req.log.error({ err }, "RequestResetCode error");
    res.status(500).json({ message: "Erro interno" });
  }
});

router.post("/reset-password", async (req, res) => {
  try {
    const { phone, code, newPassword } = req.body as { phone?: string; code?: string; newPassword?: string };
    if (!phone || !code || !newPassword) {
      res.status(400).json({ message: "Telefone, código e nova senha são obrigatórios" });
      return;
    }
    if (newPassword.length < 6) {
      res.status(400).json({ message: "A senha deve ter no mínimo 6 caracteres" });
      return;
    }
    const cleanPhone = phone.replace(/\D/g, "");
    const stored = resetCodes.get(cleanPhone);
    if (!stored || stored.code !== code || Date.now() > stored.expiresAt) {
      res.status(400).json({ message: "Código inválido ou expirado" });
      return;
    }
    resetCodes.delete(cleanPhone);
    const [user] = await db.select().from(usersTable).where(eq(usersTable.phone, cleanPhone));
    if (!user) {
      res.status(404).json({ message: "Nenhuma conta encontrada com esse telefone" });
      return;
    }
    const newHash = hashPassword(newPassword);
    await db.update(usersTable).set({ passwordHash: newHash }).where(eq(usersTable.id, user.id));
    const token = signToken({ userId: user.id, isAdmin: user.isAdmin });
    res.json({
      token,
      user: {
        id: user.id,
        name: user.name,
        phone: user.phone,
        coins: user.coins,
        isAdmin: user.isAdmin,
        createdAt: user.createdAt,
      },
    });
  } catch (err) {
    req.log.error({ err }, "ResetPassword error");
    res.status(500).json({ message: "Erro interno" });
  }
});

// ─── Google OAuth (browser-based, Expo Go compatible) ─────────────────────────

type GoogleOAuthState =
  | { status: "pending"; createdAt: number }
  | { status: "done"; token: string; user: object; createdAt: number }
  | { status: "error"; message: string; createdAt: number };

const googleStates = new Map<string, GoogleOAuthState>();

// Clean up states older than 10 minutes
function cleanOldStates() {
  const cutoff = Date.now() - 10 * 60 * 1000;
  for (const [key, val] of googleStates.entries()) {
    if (val.createdAt < cutoff) googleStates.delete(key);
  }
}

function getGoogleRedirectUri(req: any): string {
  const host = process.env["REPLIT_DEV_DOMAIN"]
    ? `https://${process.env["REPLIT_DEV_DOMAIN"]}`
    : `${req.protocol}://${req.get("host")}`;
  return `${host}/api/auth/google/callback`;
}

// Step 1: Generate state + return Google OAuth URL
router.get("/google/start", (req, res) => {
  cleanOldStates();
  const state = uuidv4();
  googleStates.set(state, { status: "pending", createdAt: Date.now() });

  const clientId = process.env["GOOGLE_CLIENT_ID"];
  if (!clientId) {
    res.status(500).json({ message: "Google OAuth não configurado" });
    return;
  }

  const redirectUri = getGoogleRedirectUri(req);
  const params = new URLSearchParams({
    client_id: clientId,
    redirect_uri: redirectUri,
    response_type: "code",
    scope: "openid email profile",
    state,
    access_type: "online",
    prompt: "select_account",
  });

  res.json({ url: `https://accounts.google.com/o/oauth2/v2/auth?${params}`, state });
});

// Step 2: Google redirects here with ?code=...&state=...
router.get("/google/callback", async (req, res) => {
  const { code, state, error } = req.query as { code?: string; state?: string; error?: string };

  const closeHtml = (title: string, msg: string, ok: boolean) => `
<!DOCTYPE html>
<html lang="pt-BR">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${title}</title>
<style>
  *{box-sizing:border-box;margin:0;padding:0}
  body{font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;display:flex;align-items:center;justify-content:center;min-height:100vh;background:#020205;color:#fff}
  .card{text-align:center;padding:2.5rem 2rem;max-width:340px;width:90%}
  .icon{font-size:3rem;margin-bottom:1rem}
  h2{font-size:1.4rem;font-weight:700;color:${ok ? "#a78bfa" : "#f87171"};margin-bottom:.5rem}
  p{font-size:.95rem;color:rgba(255,255,255,0.5);line-height:1.5;margin-bottom:1.5rem}
  .btn{display:inline-block;padding:.75rem 2rem;background:${ok ? "linear-gradient(135deg,#7C3AED,#6D28D9)" : "rgba(239,68,68,0.15)"};color:#fff;border-radius:12px;font-size:.95rem;font-weight:600;text-decoration:none;border:none;cursor:pointer}
  .sub{font-size:.78rem;color:rgba(255,255,255,0.25);margin-top:1rem}
</style>
</head>
<body><div class="card">
<div class="icon">${ok ? "✅" : "❌"}</div>
<h2>${title}</h2>
<p>${msg}</p>
<button class="btn" onclick="window.close()">Fechar e voltar ao app</button>
<p class="sub">O app detectará o login automaticamente</p>
</div></body></html>`;

  if (error || !code || !state) {
    if (state) googleStates.set(state, { status: "error", message: "Login cancelado", createdAt: Date.now() });
    res.send(closeHtml("Login cancelado", "O login com Google foi cancelado.", false));
    return;
  }

  if (!googleStates.has(state as string)) {
    res.send(closeHtml("Estado inválido", "Link expirado ou inválido.", false));
    return;
  }

  try {
    const clientId = process.env["GOOGLE_CLIENT_ID"]!;
    const clientSecret = process.env["GOOGLE_CLIENT_SECRET"]!;
    const redirectUri = getGoogleRedirectUri(req);

    // Exchange code for tokens
    const tokenRes = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        code: code as string,
        client_id: clientId,
        client_secret: clientSecret,
        redirect_uri: redirectUri,
        grant_type: "authorization_code",
      }),
    });

    if (!tokenRes.ok) {
      const errBody = await tokenRes.text();
      req.log.error({ errBody }, "Google token exchange failed");
      googleStates.set(state as string, { status: "error", message: "Falha ao trocar código Google", createdAt: Date.now() });
      res.send(closeHtml("Erro", "Não foi possível autenticar com o Google.", false));
      return;
    }

    const { access_token } = await tokenRes.json() as { access_token: string };

    // Get user info
    const userRes = await fetch("https://www.googleapis.com/oauth2/v3/userinfo", {
      headers: { Authorization: `Bearer ${access_token}` },
    });

    if (!userRes.ok) {
      googleStates.set(state as string, { status: "error", message: "Falha ao obter dados do Google", createdAt: Date.now() });
      res.send(closeHtml("Erro", "Não foi possível obter seus dados do Google.", false));
      return;
    }

    const googleUser = await userRes.json() as { sub: string; name: string; email: string };
    const googlePhone = `google_${googleUser.sub}`;

    let [user] = await db.select().from(usersTable).where(eq(usersTable.phone, googlePhone));

    if (!user) {
      const id = uuidv4();
      [user] = await db
        .insert(usersTable)
        .values({ id, name: googleUser.name, phone: googlePhone, passwordHash: "google_oauth", coins: 30, isAdmin: false })
        .returning();
    }

    const jwt = signToken({ userId: user.id, isAdmin: user.isAdmin });
    const userPayload = {
      id: user.id,
      name: user.name,
      phone: user.phone,
      coins: user.coins,
      isAdmin: user.isAdmin,
      createdAt: user.createdAt,
    };

    googleStates.set(state as string, { status: "done", token: jwt, user: userPayload, createdAt: Date.now() });
    res.send(closeHtml("Login realizado!", `Bem-vindo, ${googleUser.name}!`, true));
  } catch (err) {
    req.log.error({ err }, "Google callback error");
    if (state) googleStates.set(state as string, { status: "error", message: "Erro interno", createdAt: Date.now() });
    res.send(closeHtml("Erro", "Ocorreu um erro inesperado.", false));
  }
});

// Step 3: App polls this until token is ready
router.get("/google/poll/:state", (req, res) => {
  const { state } = req.params;
  const entry = googleStates.get(state);

  if (!entry) {
    res.status(404).json({ message: "Estado não encontrado ou expirado" });
    return;
  }

  if (entry.status === "pending") {
    res.json({ status: "pending" });
    return;
  }

  if (entry.status === "error") {
    googleStates.delete(state);
    res.status(400).json({ status: "error", message: entry.message });
    return;
  }

  // done — return token and clean up
  googleStates.delete(state);
  res.json({ status: "done", token: entry.token, user: entry.user });
});

// Legacy: POST /google with access_token directly
router.post("/google", async (req, res) => {
  try {
    const { access_token } = req.body as { access_token?: string };
    if (!access_token) {
      res.status(400).json({ message: "Token de acesso é obrigatório" });
      return;
    }

    const googleRes = await fetch("https://www.googleapis.com/oauth2/v3/userinfo", {
      headers: { Authorization: `Bearer ${access_token}` },
    });

    if (!googleRes.ok) {
      res.status(401).json({ message: "Token do Google inválido" });
      return;
    }

    const googleUser = await googleRes.json() as { sub: string; name: string; email: string };
    const googlePhone = `google_${googleUser.sub}`;

    let [user] = await db.select().from(usersTable).where(eq(usersTable.phone, googlePhone));

    if (!user) {
      const id = uuidv4();
      [user] = await db
        .insert(usersTable)
        .values({ id, name: googleUser.name, phone: googlePhone, passwordHash: "google_oauth", coins: 30, isAdmin: false })
        .returning();
    }

    const token = signToken({ userId: user.id, isAdmin: user.isAdmin });
    res.json({
      token,
      user: {
        id: user.id,
        name: user.name,
        phone: user.phone,
        coins: user.coins,
        isAdmin: user.isAdmin,
        createdAt: user.createdAt,
      },
    });
  } catch (err) {
    req.log.error({ err }, "Google login error");
    res.status(500).json({ message: "Erro interno" });
  }
});

router.delete("/account", requireAuth, async (req: AuthRequest, res) => {
  try {
    const userId = req.userId!;
    const userBots = await db.select().from(botsTable).where(eq(botsTable.userId, userId));
    for (const bot of userBots) {
      await db.delete(botCommandsTable).where(eq(botCommandsTable.botId, bot.id));
    }
    await db.delete(botsTable).where(eq(botsTable.userId, userId));
    await db.delete(activePlansTable).where(eq(activePlansTable.userId, userId));
    await db.delete(paymentsTable).where(eq(paymentsTable.userId, userId));
    await db.delete(notificationsTable).where(eq(notificationsTable.userId, userId));
    await db.delete(usersTable).where(eq(usersTable.id, userId));
    res.json({ message: "Conta excluída com sucesso" });
  } catch (err) {
    req.log.error({ err }, "DeleteAccount error");
    res.status(500).json({ message: "Erro interno" });
  }
});

export default router;
