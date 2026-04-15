import { pgTable, text, timestamp } from "drizzle-orm/pg-core";

export const botMessageEventsTable = pgTable("bot_message_events", {
  id: text("id").primaryKey(),
  botId: text("bot_id").notNull(),
  processedAt: timestamp("processed_at").notNull().defaultNow(),
});

export type BotMessageEvent = typeof botMessageEventsTable.$inferSelect;
