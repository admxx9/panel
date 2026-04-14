import { Router } from "express";
import { db, usersTable, botsTable, activePlansTable, paymentsTable } from "@workspace/db";
import { eq, and, gte } from "drizzle-orm";
import { requireAuth, type AuthRequest } from "../lib/auth.js";

const router = Router();

router.get("/dashboard", requireAuth, async (req: AuthRequest, res) => {
  try {
    const userId = req.userId!;
    const [user] = await db.select().from(usersTable).where(eq(usersTable.id, userId));
    if (!user) {
      res.status(404).json({ message: "Usuário não encontrado" });
      return;
    }

    const bots = await db.select().from(botsTable).where(eq(botsTable.userId, userId));
    const activeBots = bots.filter((b) => b.status === "connected");

    let activePlanName: string | null = null;
    let planExpiresAt: Date | null = null;

    const now = new Date();
    const [plan] = await db
      .select()
      .from(activePlansTable)
      .where(and(eq(activePlansTable.userId, userId), eq(activePlansTable.status, "active"), gte(activePlansTable.expiresAt, now)));

    if (plan) {
      activePlanName = plan.planName;
      planExpiresAt = plan.expiresAt;
    }

    const payments = await db.select().from(paymentsTable).where(eq(paymentsTable.userId, userId));
    const recentPayments = payments.slice(-5).map((p) => ({
      id: p.id,
      type: p.type === "topup" ? "topup" : "plan",
      description:
        p.type === "topup"
          ? `Recarga de ${p.coins} moedas - R$ ${p.amount.toFixed(2)}`
          : `Ativação de plano`,
      createdAt: p.createdAt,
    }));

    res.json({
      totalBots: bots.length,
      activeBots: activeBots.length,
      coins: user.coins,
      activePlan: activePlanName,
      planExpiresAt: planExpiresAt,
      totalMessages: 0,
      recentActivity: recentPayments,
    });
  } catch (err) {
    req.log.error({ err }, "Dashboard error");
    res.status(500).json({ message: "Erro interno" });
  }
});

export default router;
