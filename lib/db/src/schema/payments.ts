import { pgTable, text, integer, real, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const paymentsTable = pgTable("payments", {
  id: text("id").primaryKey(),
  userId: text("user_id").notNull(),
  type: text("type").notNull().default("topup"),
  amount: real("amount").notNull(),
  coins: integer("coins").notNull(),
  status: text("status").notNull().default("pending"),
  txid: text("txid").notNull().unique(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  paidAt: timestamp("paid_at"),
});

export const insertPaymentSchema = createInsertSchema(paymentsTable).omit({
  createdAt: true,
});
export type InsertPayment = z.infer<typeof insertPaymentSchema>;
export type Payment = typeof paymentsTable.$inferSelect;
