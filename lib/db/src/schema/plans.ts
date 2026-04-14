import { pgTable, text, integer, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const activePlansTable = pgTable("active_plans", {
  id: text("id").primaryKey(),
  userId: text("user_id").notNull().unique(),
  planId: text("plan_id").notNull(),
  planName: text("plan_name").notNull(),
  status: text("status").notNull().default("active"),
  maxGroups: integer("max_groups").notNull().default(1),
  activatedAt: timestamp("activated_at").notNull().defaultNow(),
  expiresAt: timestamp("expires_at").notNull(),
});

export const insertActivePlanSchema = createInsertSchema(activePlansTable).omit({
  activatedAt: true,
});
export type InsertActivePlan = z.infer<typeof insertActivePlanSchema>;
export type ActivePlan = typeof activePlansTable.$inferSelect;
