import { Router } from "express";
import { db, notificationsTable } from "@workspace/db";
import { eq, and, desc, count } from "drizzle-orm";
import { requireAuth, type AuthRequest } from "../lib/auth.js";
import { randomUUID } from "crypto";

const router = Router();

router.get("/", requireAuth, async (req: AuthRequest, res) => {
  try {
    const items = await db
      .select()
      .from(notificationsTable)
      .where(eq(notificationsTable.userId, req.userId!))
      .orderBy(desc(notificationsTable.createdAt))
      .limit(50);
    res.json(items);
  } catch (err) {
    req.log.error({ err }, "Failed to list notifications");
    res.status(500).json({ message: "Erro interno" });
  }
});

router.get("/unread-count", requireAuth, async (req: AuthRequest, res) => {
  try {
    const [result] = await db
      .select({ value: count() })
      .from(notificationsTable)
      .where(
        and(
          eq(notificationsTable.userId, req.userId!),
          eq(notificationsTable.read, false)
        )
      );
    res.json({ count: result?.value ?? 0 });
  } catch (err) {
    req.log.error({ err }, "Failed to count unread");
    res.status(500).json({ message: "Erro interno" });
  }
});

router.post("/read-all", requireAuth, async (req: AuthRequest, res) => {
  try {
    await db
      .update(notificationsTable)
      .set({ read: true })
      .where(
        and(
          eq(notificationsTable.userId, req.userId!),
          eq(notificationsTable.read, false)
        )
      );
    res.json({ ok: true });
  } catch (err) {
    req.log.error({ err }, "Failed to mark all read");
    res.status(500).json({ message: "Erro interno" });
  }
});

router.post("/:id/read", requireAuth, async (req: AuthRequest, res) => {
  try {
    await db
      .update(notificationsTable)
      .set({ read: true })
      .where(
        and(
          eq(notificationsTable.id, req.params.id),
          eq(notificationsTable.userId, req.userId!)
        )
      );
    res.json({ ok: true });
  } catch (err) {
    req.log.error({ err }, "Failed to mark read");
    res.status(500).json({ message: "Erro interno" });
  }
});

export default router;

export async function createNotification(userId: string, title: string, body: string, type = "info") {
  return db.insert(notificationsTable).values({
    id: randomUUID(),
    userId,
    title,
    body,
    type,
  });
}
