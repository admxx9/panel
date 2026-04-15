import { pgTable, text, integer, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const botsTable = pgTable("bots", {
  id: text("id").primaryKey(),
  userId: text("user_id").notNull(),
  name: text("name").notNull(),
  phone: text("phone"),
  status: text("status").notNull().default("disconnected"),
  connectionType: text("connection_type"),
  qrCode: text("qr_code"),
  pairCode: text("pair_code"),
  totalGroups: integer("total_groups").notNull().default(0),
  prefix: text("prefix").default("."),
  ownerPhone: text("owner_phone"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  connectedAt: timestamp("connected_at"),
  messagesProcessed: integer("messages_processed").notNull().default(0),
});

export const insertBotSchema = createInsertSchema(botsTable).omit({
  createdAt: true,
});
export type InsertBot = z.infer<typeof insertBotSchema>;
export type Bot = typeof botsTable.$inferSelect;
