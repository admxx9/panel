import { Router } from "express";
import { v4 as uuidv4 } from "uuid";
import { db, usersTable, activePlansTable } from "@workspace/db";
import { eq, and, gte } from "drizzle-orm";
import { requireAuth, type AuthRequest } from "../lib/auth.js";

const router = Router();

const PLANS = [
  {
    id: "basico",
    name: "Basico",
    description: "Ideal para começar com um bot no WhatsApp",
    coins: 100,
    days: 30,
    maxGroups: 1,
    features: [
      "1 grupo de WhatsApp",
      "Comandos personalizados basicos",
      "Suporte via chat",
      "Atualizacoes automaticas",
    ],
  },
  {
    id: "pro",
    name: "Pro",
    description: "Para quem precisa de mais grupos e recursos avancados",
    coins: 250,
    days: 30,
    maxGroups: 5,
    features: [
      "5 grupos de WhatsApp",
      "Comandos personalizados avancados",
      "Builder visual completo",
      "Suporte prioritario",
      "Atualizacoes automaticas",
    ],
  },
  {
    id: "premium",
    name: "Premium",
    description: "Sem limites — para profissionais e empresas",
    coins: 500,
    days: 30,
    maxGroups: -1,
    features: [
      "Grupos ilimitados",
      "Todos os recursos Pro",
      "API de integracao",
      "Suporte VIP 24/7",
      "Dashboard de analytics",
      "Atualizacoes prioritarias",
    ],
  },
];

router.get("/", (_req, res) => {
  res.json(PLANS);
});

router.get("/active", requireAuth, async (req: AuthRequest, res) => {
  try {
    const now = new Date();
    const [plan] = await db
      .select()
      .from(activePlansTable)
      .where(
        and(
          eq(activePlansTable.userId, req.userId!),
          eq(activePlansTable.status, "active"),
          gte(activePlansTable.expiresAt, now)
        )
      );

    if (!plan) {
      res.json({});
      return;
    }

    res.json({
      id: plan.id,
      planId: plan.planId,
      planName: plan.planName,
      status: plan.status,
      maxGroups: plan.maxGroups,
      activatedAt: plan.activatedAt,
      expiresAt: plan.expiresAt,
    });
  } catch (err) {
    req.log.error({ err }, "Get active plan error");
    res.status(500).json({ message: "Erro interno" });
  }
});

router.post("/:planId/activate", requireAuth, async (req: AuthRequest, res) => {
  try {
    const { planId } = req.params as { planId: string };
    const plan = PLANS.find((p) => p.id === planId);
    if (!plan) {
      res.status(404).json({ message: "Plano não encontrado" });
      return;
    }

    const [user] = await db.select().from(usersTable).where(eq(usersTable.id, req.userId!));
    if (!user) {
      res.status(404).json({ message: "Usuário não encontrado" });
      return;
    }

    if (user.coins < plan.coins) {
      res.status(402).json({ message: `Moedas insuficientes. Você tem ${user.coins} moedas e o plano custa ${plan.coins} moedas.` });
      return;
    }

    await db.update(usersTable).set({ coins: user.coins - plan.coins }).where(eq(usersTable.id, req.userId!));

    await db
      .update(activePlansTable)
      .set({ status: "expired" })
      .where(and(eq(activePlansTable.userId, req.userId!), eq(activePlansTable.status, "active")));

    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + plan.days);

    const [activePlan] = await db
      .insert(activePlansTable)
      .values({
        id: uuidv4(),
        userId: req.userId!,
        planId: plan.id,
        planName: plan.name,
        status: "active",
        maxGroups: plan.maxGroups,
        expiresAt,
      })
      .returning();

    res.json({
      id: activePlan.id,
      planId: activePlan.planId,
      planName: activePlan.planName,
      status: activePlan.status,
      maxGroups: activePlan.maxGroups,
      activatedAt: activePlan.activatedAt,
      expiresAt: activePlan.expiresAt,
    });
  } catch (err) {
    req.log.error({ err }, "Activate plan error");
    res.status(500).json({ message: "Erro interno" });
  }
});

export default router;
