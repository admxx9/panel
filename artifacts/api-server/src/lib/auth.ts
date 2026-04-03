import jwt from "jsonwebtoken";
import bcryptjs from "bcryptjs";
import type { Request, Response, NextFunction } from "express";

const JWT_SECRET = process.env["SESSION_SECRET"] || "botaluguel-pro-secret-2024";

export function hashPassword(password: string): string {
  return bcryptjs.hashSync(password, 10);
}

export function verifyPassword(password: string, hash: string): boolean {
  return bcryptjs.compareSync(password, hash);
}

export function signToken(payload: { userId: string; isAdmin: boolean }): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: "7d" });
}

export function verifyToken(token: string): { userId: string; isAdmin: boolean } | null {
  try {
    return jwt.verify(token, JWT_SECRET) as { userId: string; isAdmin: boolean };
  } catch {
    return null;
  }
}

export interface AuthRequest extends Request {
  userId?: string;
  isAdmin?: boolean;
}

export function requireAuth(req: AuthRequest, res: Response, next: NextFunction): void {
  const authHeader = req.headers["authorization"];
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    res.status(401).json({ message: "Token não fornecido" });
    return;
  }
  const token = authHeader.slice(7);
  const payload = verifyToken(token);
  if (!payload) {
    res.status(401).json({ message: "Token inválido ou expirado" });
    return;
  }
  req.userId = payload.userId;
  req.isAdmin = payload.isAdmin;
  next();
}

export function requireAdmin(req: AuthRequest, res: Response, next: NextFunction): void {
  requireAuth(req, res, () => {
    if (!req.isAdmin) {
      res.status(403).json({ message: "Acesso negado" });
      return;
    }
    next();
  });
}
