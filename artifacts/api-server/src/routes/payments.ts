import { Router } from "express";
import { v4 as uuidv4 } from "uuid";
import { db, usersTable, paymentsTable } from "@workspace/db";
import { eq, desc, sql } from "drizzle-orm";
import { requireAuth, type AuthRequest } from "../lib/auth.js";
import {
  createPixCharge,
  getPixChargeStatus,
  type EfiBankWebhookPayload,
} from "../lib/efiBank.js";

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

    let qrCodeBase64: string | null = null;
    let copyPaste: string = "";
    let expiresAt = new Date(Date.now() + 3600 * 1000);

    try {
      const charge = await createPixCharge(txid, amount);
      qrCodeBase64 = charge.qrCodeBase64;
      copyPaste = charge.copyPaste;
      expiresAt = charge.expiresAt;
    } catch (efiErr: any) {
      const efiBody = efiErr?.response?.data ?? null;
      req.log.error({ err: efiErr?.message, efiResponse: efiBody }, "EFI Bank createPixCharge error — returning pending without QR");
    }

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

    if (payment.status === "pending") {
      try {
        const efStatus = await getPixChargeStatus(txid);
        if (efStatus.status === "paid") {
          await db.transaction(async (tx) => {
            await tx
              .update(paymentsTable)
              .set({ status: "paid", paidAt: efStatus.paidAt ?? new Date() })
              .where(eq(paymentsTable.txid, txid));

            await tx
              .update(usersTable)
              .set({ coins: sql`${usersTable.coins} + ${payment.coins}` })
              .where(eq(usersTable.id, payment.userId));
          });

          return res.json({
            txid: payment.txid,
            status: "paid" as const,
            coins: payment.coins,
            paidAt: efStatus.paidAt,
          });
        }

        if (efStatus.status === "expired") {
          await db
            .update(paymentsTable)
            .set({ status: "expired" })
            .where(eq(paymentsTable.txid, txid));
          return res.json({ txid: payment.txid, status: "expired" as const, coins: payment.coins, paidAt: null });
        }
      } catch (efiErr) {
        req.log.warn({ err: efiErr }, "EFI status check failed, returning DB status");
      }
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

const WEBHOOK_PIX_TOKEN = process.env["WEBHOOK_PIX_TOKEN"] || "";

router.post("/pix/webhook", async (req, res) => {
  try {
    if (!WEBHOOK_PIX_TOKEN) {
      req.log.error({ ip: req.ip }, "PIX webhook called but WEBHOOK_PIX_TOKEN is not configured — rejecting");
      res.status(401).json({ message: "Token inválido" });
      return;
    }

    const authHeader = req.headers["authorization"];
    const queryToken = req.query?.["token"] as string | undefined;
    const provided = authHeader?.startsWith("Bearer ")
      ? authHeader.slice(7)
      : queryToken;
    if (provided !== WEBHOOK_PIX_TOKEN) {
      req.log.warn({
        ip: req.ip,
        userAgent: req.headers["user-agent"],
        contentType: req.headers["content-type"],
        hasAuthorization: !!authHeader,
        hasQueryToken: !!queryToken,
        payloadKeys: req.body ? Object.keys(req.body) : [],
      }, "PIX webhook rejected — invalid or missing token");
      res.status(401).json({ message: "Token inválido" });
      return;
    }

    const payload = req.body as EfiBankWebhookPayload;
    req.log.info({ payload }, "EFI Bank webhook received");

    if (!payload?.pix?.length) {
      res.status(200).send();
      return;
    }

    for (const pixEvent of payload.pix) {
      const { txid, horario } = pixEvent;
      if (!txid) continue;

      const [payment] = await db
        .select()
        .from(paymentsTable)
        .where(eq(paymentsTable.txid, txid));

      if (!payment || payment.status === "paid") continue;

      const paidAt = horario ? new Date(horario) : new Date();

      await db.transaction(async (tx) => {
        await tx
          .update(paymentsTable)
          .set({ status: "paid", paidAt })
          .where(eq(paymentsTable.txid, txid));

        await tx
          .update(usersTable)
          .set({ coins: sql`${usersTable.coins} + ${payment.coins}` })
          .where(eq(usersTable.id, payment.userId));
      });

      req.log.info({ txid, coins: payment.coins, userId: payment.userId }, "PIX payment confirmed — coins credited");
    }

    res.status(200).send();
  } catch (err) {
    req.log.error({ err }, "EFI Bank webhook error");
    res.status(500).send();
  }
});

router.get("/history", requireAuth, async (req: AuthRequest, res) => {
  try {
    const payments = await db
      .select()
      .from(paymentsTable)
      .where(eq(paymentsTable.userId, req.userId!))
      .orderBy(desc(paymentsTable.createdAt));

    res.json(
      payments.map((p) => ({
        id: p.id,
        userId: p.userId,
        type: p.type,
        amount: p.amount,
        coins: p.coins,
        status: p.status,
        txid: p.txid,
        createdAt: p.createdAt,
        paidAt: p.paidAt,
      }))
    );
  } catch (err) {
    req.log.error({ err }, "Payment history error");
    res.status(500).json({ message: "Erro interno" });
  }
});

export default router;
