import { Router } from "express";
import { v4 as uuidv4 } from "uuid";
import { db, usersTable, paymentsTable } from "@workspace/db";
import { eq, desc } from "drizzle-orm";
import { requireAuth, type AuthRequest } from "../lib/auth.js";

const router = Router();

const BRL_PER_COIN = 0.01;

router.post("/pix", requireAuth, async (req: AuthRequest, res) => {
  try {
    const { amount } = req.body as { amount?: number };
    if (!amount || amount <= 0) {
      res.status(400).json({ message: "Valor inválido" });
      return;
    }

    const coins = Math.floor(amount / BRL_PER_COIN);
    const txid = uuidv4().replace(/-/g, "").substring(0, 35);

    const pixKey = process.env["EFI_PIX_KEY"] || "11999999999";
    const pixPayload = `000201010212261000br.gov.bcb.pix2562api.efipay.com.br/v2/${txid}52040000530398654${amount.toFixed(2).length + 1}${amount.toFixed(2)}5802BR5925BotAluguel Pro6009SAO PAULO62070503***6304`;

    const qrCodeBase64 = null;
    const copyPaste = pixPayload;

    const expiresAt = new Date(Date.now() + 3600 * 1000);

    const [payment] = await db
      .insert(paymentsTable)
      .values({
        id: uuidv4(),
        userId: req.userId!,
        type: "topup",
        amount,
        coins,
        status: "pending",
        txid,
      })
      .returning();

    res.status(201).json({
      txid: payment.txid,
      amount: payment.amount,
      coins: payment.coins,
      status: payment.status,
      qrCodeBase64,
      copyPaste,
      expiresAt,
      createdAt: payment.createdAt,
    });
  } catch (err) {
    req.log.error({ err }, "Create PIX error");
    res.status(500).json({ message: "Erro interno" });
  }
});

router.get("/pix/:txid", requireAuth, async (req: AuthRequest, res) => {
  try {
    const { txid } = req.params as { txid: string };
    const [payment] = await db.select().from(paymentsTable).where(eq(paymentsTable.txid, txid));

    if (!payment) {
      res.status(404).json({ message: "Pagamento não encontrado" });
      return;
    }

    if (payment.userId !== req.userId) {
      res.status(403).json({ message: "Acesso negado" });
      return;
    }

    res.json({
      txid: payment.txid,
      status: payment.status as "pending" | "paid" | "expired" | "error",
      coins: payment.coins,
      paidAt: payment.paidAt,
    });
  } catch (err) {
    req.log.error({ err }, "Check PIX error");
    res.status(500).json({ message: "Erro interno" });
  }
});

router.get("/history", requireAuth, async (req: AuthRequest, res) => {
  try {
    const payments = await db
      .select()
      .from(paymentsTable)
      .where(eq(paymentsTable.userId, req.userId!))
      .orderBy(desc(paymentsTable.createdAt));

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
    req.log.error({ err }, "Payment history error");
    res.status(500).json({ message: "Erro interno" });
  }
});

export default router;
