import { pgTable, text, timestamp, index } from "drizzle-orm/pg-core";

export const botMessageEventsTable = pgTable(
  "bot_message_events",
  {
    id: text("id").primaryKey(),
    botId: text("bot_id").notNull(),
    processedAt: timestamp("processed_at").notNull().defaultNow(),
  },
  (t) => [index("idx_bme_bot_id_processed_at").on(t.botId, t.processedAt)]
);

export type BotMessageEvent = typeof botMessageEventsTable.$inferSelect;
