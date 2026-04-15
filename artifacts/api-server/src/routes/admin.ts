import { Router } from "express";
import { db, usersTable, botsTable, paymentsTable, notificationsTable } from "@workspace/db";
import { eq, sum, count, desc, inArray } from "drizzle-orm";
import { requireAdmin, type AuthRequest } from "../lib/auth.js";
import { randomUUID } from "crypto";
import { sendExpoPush } from "../lib/expoPush.js";

const router = Router();

router.get("/users", requireAdmin, async (req: AuthRequest, res) => {
  try {
    const users = await db.select().from(usersTable);
    res.json(users.map((u) => ({
      id: u.id,
      name: u.name,
      phone: u.phone,
      coins: u.coins,
      isAdmin: u.isAdmin,
      createdAt: u.createdAt,
    })));
  } catch (err) {
    req.log.error({ err }, "Admin list users error");
    res.status(500).json({ message: "Erro interno" });
  }
});

router.get("/stats", requireAdmin, async (req: AuthRequest, res) => {
  try {
    const [usersCount] = await db.select({ count: count() }).from(usersTable);
    const [botsCount] = await db.select({ count: count() }).from(botsTable);
    const activeBots = await db.select().from(botsTable).where(eq(botsTable.status, "connected"));
    const allPayments = await db.select().from(paymentsTable);
    const paidPayments = allPayments.filter((p) => p.status === "paid");
    const pendingPayments = allPayments.filter((p) => p.status === "pending");
    const totalRevenue = paidPayments.reduce((sum, p) => sum + p.amount, 0);

    res.json({
      totalUsers: usersCount.count,
      totalBots: botsCount.count,
      activeBots: activeBots.length,
      totalRevenue,
      pendingPayments: pendingPayments.length,
      totalPlans: 3,
    });
  } catch (err) {
    req.log.error({ err }, "Admin stats error");
    res.status(500).json({ message: "Erro interno" });
  }
});

router.get("/payments", requireAdmin, async (req: AuthRequest, res) => {
  try {
    const payments = await db.select().from(paymentsTable);
    res.json(payments.map((p) => ({
      id: p.id,
      userId: p.userId,
      type: p.type,
      amount: p.amount,
      coins: p.coins,
      status: p.status,
      txid: p.txid,
      createdAt: p.createdAt,
      paidAt: p.paidAt,
    })));
  } catch (err) {
    req.log.error({ err }, "Admin payments error");
    res.status(500).json({ message: "Erro interno" });
  }
});

router.post("/notifications/send", requireAdmin, async (req: AuthRequest, res) => {
  try {
    const { title, body, type, targetUserId } = req.body;
    const trimTitle = typeof title === "string" ? title.trim() : "";
    const trimBody = typeof body === "string" ? body.trim() : "";
    if (!trimTitle || !trimBody) {
      res.status(400).json({ message: "Título e corpo são obrigatórios" });
      return;
    }
    const allowedTypes = ["info", "success", "warning", "error", "bot", "coins"];
    const safeType = allowedTypes.includes(type) ? type : "info";

    let targetUsers: { id: string }[];
    if (targetUserId && targetUserId !== "all") {
      const [found] = await db.select({ id: usersTable.id }).from(usersTable).where(eq(usersTable.id, targetUserId));
      if (!found) {
        res.status(404).json({ message: "Usuário não encontrado" });
        return;
      }
      targetUsers = [found];
    } else {
      targetUsers = await db.select({ id: usersTable.id }).from(usersTable);
    }

    const notifications = targetUsers.map((u) => ({
      id: randomUUID(),
      userId: u.id,
      title: trimTitle,
      body: trimBody,
      type: safeType,
    }));

    if (notifications.length > 0) {
      await db.insert(notificationsTable).values(notifications);
    }

    if (targetUsers.length > 0) {
      const userIds = targetUsers.map((u) => u.id);
      const usersWithTokens = await db
        .select({ id: usersTable.id, expoPushToken: usersTable.expoPushToken })
        .from(usersTable)
        .where(inArray(usersTable.id, userIds));
      const pushMessages = usersWithTokens
        .filter((u) => u.expoPushToken)
        .map((u) => ({
          to: u.expoPushToken!,
          title: trimTitle,
          body: trimBody,
          sound: "default" as const,
          data: { type: safeType },
        }));
      if (pushMessages.length > 0) {
        void sendExpoPush(pushMessages);
      }
    }

    res.json({ ok: true, sent: notifications.length });
  } catch (err) {
    req.log.error({ err }, "Admin send notification error");
    res.status(500).json({ message: "Erro interno" });
  }
});

router.get("/notifications", requireAdmin, async (req: AuthRequest, res) => {
  try {
    const items = await db
      .select()
      .from(notificationsTable)
      .orderBy(desc(notificationsTable.createdAt))
      .limit(100);
    res.json(items);
  } catch (err) {
    req.log.error({ err }, "Admin list notifications error");
    res.status(500).json({ message: "Erro interno" });
  }
});

export default router;
