import { pgTable, text, jsonb, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const botCommandsTable = pgTable("bot_commands", {
  id: text("id").primaryKey(),
  botId: text("bot_id").notNull().unique(),
  nodes: jsonb("nodes").notNull().default([]),
  edges: jsonb("edges").notNull().default([]),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const insertBotCommandSchema = createInsertSchema(botCommandsTable).omit({
  updatedAt: true,
});
export type InsertBotCommand = z.infer<typeof insertBotCommandSchema>;
export type BotCommand = typeof botCommandsTable.$inferSelect;
