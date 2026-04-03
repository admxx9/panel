import { Router } from "express";
import { v4 as uuidv4 } from "uuid";
import { db, usersTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import { hashPassword, verifyPassword, signToken, requireAuth, type AuthRequest } from "../lib/auth.js";

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

export default router;
