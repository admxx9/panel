import { Router } from "express";
import { db, usersTable, botsTable, paymentsTable } from "@workspace/db";
import { eq, sum, count } from "drizzle-orm";
import { requireAdmin, type AuthRequest } from "../lib/auth.js";

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

export default router;
