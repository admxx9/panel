import { Router } from "express";
import { v4 as uuidv4 } from "uuid";
import { db, botsTable, botCommandsTable } from "@workspace/db";
import { eq, and } from "drizzle-orm";
import { requireAuth, type AuthRequest } from "../lib/auth.js";
import {
  startWhatsAppSession,
  disconnectWhatsApp,
  addSseClient,
  removeSseClient,
} from "../lib/whatsapp.js";
import { createResourceLimiter } from "../lib/rateLimiter.js";

const router = Router();

router.get("/", requireAuth, async (req: AuthRequest, res) => {
  try {
    const bots = await db.select().from(botsTable).where(eq(botsTable.userId, req.userId!));
    res.json(bots.map(formatBot));
  } catch (err) {
    req.log.error({ err }, "List bots error");
    res.status(500).json({ message: "Erro interno" });
  }
});

router.post("/", requireAuth, createResourceLimiter, async (req: AuthRequest, res) => {
  try {
    const { name } = req.body as { name?: string };
    if (!name) {
      res.status(400).json({ message: "Nome do bot é obrigatório" });
      return;
    }
    const [bot] = await db
      .insert(botsTable)
      .values({
        id: uuidv4(),
        userId: req.userId!,
        name,
        status: "disconnected",
        totalGroups: 0,
      })
      .returning();
    res.status(201).json(formatBot(bot));
  } catch (err) {
    req.log.error({ err }, "Create bot error");
    res.status(500).json({ message: "Erro interno" });
  }
});

router.get("/:botId", requireAuth, async (req: AuthRequest, res) => {
  try {
    const { botId } = req.params as { botId: string };
    const [bot] = await db
      .select()
      .from(botsTable)
      .where(and(eq(botsTable.id, botId), eq(botsTable.userId, req.userId!)));
    if (!bot) {
      res.status(404).json({ message: "Bot não encontrado" });
      return;
    }
    res.json(formatBot(bot));
  } catch (err) {
    req.log.error({ err }, "Get bot error");
    res.status(500).json({ message: "Erro interno" });
  }
});

router.delete("/:botId", requireAuth, async (req: AuthRequest, res) => {
  try {
    const { botId } = req.params as { botId: string };
    const [bot] = await db
      .select()
      .from(botsTable)
      .where(and(eq(botsTable.id, botId), eq(botsTable.userId, req.userId!)));
    if (!bot) {
      res.status(404).json({ message: "Bot não encontrado" });
      return;
    }
    await disconnectWhatsApp(botId);
    await db.delete(botsTable).where(eq(botsTable.id, botId));
    res.status(204).send();
  } catch (err) {
    req.log.error({ err }, "Delete bot error");
    res.status(500).json({ message: "Erro interno" });
  }
});

router.post("/:botId/connect", requireAuth, async (req: AuthRequest, res) => {
  try {
    const { botId } = req.params as { botId: string };
    const { type, phone } = req.body as { type?: string; phone?: string };

    const [bot] = await db
      .select()
      .from(botsTable)
      .where(and(eq(botsTable.id, botId), eq(botsTable.userId, req.userId!)));
    if (!bot) {
      res.status(404).json({ message: "Bot não encontrado" });
      return;
    }

    if (type !== "qrcode" && type !== "code") {
      res.status(400).json({ message: "Tipo inválido. Use 'qrcode' ou 'code'" });
      return;
    }

    if (type === "code" && !phone) {
      res.status(400).json({ message: "Telefone é obrigatório para código de pareamento" });
      return;
    }

    await db
      .update(botsTable)
      .set({
        status: "connecting",
        connectionType: type,
        qrCode: null,
        pairCode: null,
        phone: phone ? phone.replace(/\D/g, "") : bot.phone,
      })
      .where(eq(botsTable.id, botId));

    startWhatsAppSession(botId, type, phone).catch((err) => {
      req.log.error({ err, botId }, "WhatsApp session error");
    });

    res.json({ message: "Conexão iniciada", type });
  } catch (err) {
    req.log.error({ err }, "Connect bot error");
    res.status(500).json({ message: "Erro interno" });
  }
});

router.post("/:botId/disconnect", requireAuth, async (req: AuthRequest, res) => {
  try {
    const { botId } = req.params as { botId: string };
    const [bot] = await db
      .select()
      .from(botsTable)
      .where(and(eq(botsTable.id, botId), eq(botsTable.userId, req.userId!)));
    if (!bot) {
      res.status(404).json({ message: "Bot não encontrado" });
      return;
    }
    await disconnectWhatsApp(botId);
    res.json({ message: "Bot desconectado" });
  } catch (err) {
    req.log.error({ err }, "Disconnect bot error");
    res.status(500).json({ message: "Erro interno" });
  }
});

router.get("/:botId/stream", requireAuth, (req: AuthRequest, res) => {
  const { botId } = req.params as { botId: string };

  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");
  res.setHeader("X-Accel-Buffering", "no");
  res.flushHeaders();

  res.write(`event: connected\ndata: {"botId":"${botId}"}\n\n`);

  addSseClient(botId, res);

  const heartbeat = setInterval(() => {
    try {
      res.write(`:ping\n\n`);
    } catch {
      clearInterval(heartbeat);
    }
  }, 25000);

  req.on("close", () => {
    clearInterval(heartbeat);
    removeSseClient(botId, res);
  });
});

router.get("/:botId/commands", requireAuth, async (req: AuthRequest, res) => {
  try {
    const { botId } = req.params as { botId: string };
    const [bot] = await db
      .select()
      .from(botsTable)
      .where(and(eq(botsTable.id, botId), eq(botsTable.userId, req.userId!)));
    if (!bot) {
      res.status(404).json({ message: "Bot não encontrado" });
      return;
    }
    const [commands] = await db
      .select()
      .from(botCommandsTable)
      .where(eq(botCommandsTable.botId, botId));
    res.json({
      botId,
      nodes: commands?.nodes ?? [],
      edges: commands?.edges ?? [],
      updatedAt: commands?.updatedAt ?? null,
    });
  } catch (err) {
    req.log.error({ err }, "Get bot commands error");
    res.status(500).json({ message: "Erro interno" });
  }
});

router.put("/:botId/commands", requireAuth, async (req: AuthRequest, res) => {
  try {
    const { botId } = req.params as { botId: string };
    const { nodes, edges } = req.body as { nodes?: unknown[]; edges?: unknown[] };

    const [bot] = await db
      .select()
      .from(botsTable)
      .where(and(eq(botsTable.id, botId), eq(botsTable.userId, req.userId!)));
    if (!bot) {
      res.status(404).json({ message: "Bot não encontrado" });
      return;
    }
    const existing = await db
      .select()
      .from(botCommandsTable)
      .where(eq(botCommandsTable.botId, botId));
    let result;
    if (existing.length === 0) {
      [result] = await db
        .insert(botCommandsTable)
        .values({ id: uuidv4(), botId, nodes: nodes ?? [], edges: edges ?? [] })
        .returning();
    } else {
      [result] = await db
        .update(botCommandsTable)
        .set({ nodes: nodes ?? [], edges: edges ?? [], updatedAt: new Date() })
        .where(eq(botCommandsTable.botId, botId))
        .returning();
    }
    res.json({
      botId: result.botId,
      nodes: result.nodes,
      edges: result.edges,
      updatedAt: result.updatedAt,
    });
  } catch (err) {
    req.log.error({ err }, "Save bot commands error");
    res.status(500).json({ message: "Erro interno" });
  }
});

router.patch("/:botId/settings", requireAuth, async (req: AuthRequest, res) => {
  try {
    const { botId } = req.params as { botId: string };
    const { name, prefix, ownerPhone } = req.body as { name?: string; prefix?: string; ownerPhone?: string };

    const [bot] = await db
      .select()
      .from(botsTable)
      .where(and(eq(botsTable.id, botId), eq(botsTable.userId, req.userId!)));
    if (!bot) {
      res.status(404).json({ message: "Bot não encontrado" });
      return;
    }

    const updates: Partial<typeof botsTable.$inferInsert> = {};
    if (name !== undefined && name.trim()) updates.name = name.trim();
    if (prefix !== undefined) updates.prefix = prefix || ".";
    if (ownerPhone !== undefined) updates.ownerPhone = ownerPhone.replace(/\D/g, "") || null;

    const [updated] = await db
      .update(botsTable)
      .set(updates)
      .where(eq(botsTable.id, botId))
      .returning();

    res.json(formatBot(updated));
  } catch (err) {
    req.log.error({ err }, "Update bot settings error");
    res.status(500).json({ message: "Erro interno" });
  }
});

function formatBot(bot: typeof botsTable.$inferSelect) {
  return {
    id: bot.id,
    userId: bot.userId,
    name: bot.name,
    phone: bot.phone,
    status: bot.status,
    connectionType: bot.connectionType,
    qrCode: bot.qrCode,
    pairCode: bot.pairCode,
    totalGroups: bot.totalGroups,
    prefix: bot.prefix ?? ".",
    ownerPhone: bot.ownerPhone ?? null,
    createdAt: bot.createdAt,
    connectedAt: bot.connectedAt,
  };
}

export default router;
