import { pgTable, text, timestamp, integer } from "drizzle-orm/pg-core";

export const hostedBotsTable = pgTable("hosted_bots", {
  id: text("id").primaryKey(),
  userId: text("user_id").notNull(),
  name: text("name").notNull(),
  sourceType: text("source_type").notNull().default("zip"),
  githubUrl: text("github_url"),
  mainFile: text("main_file").default("index.js"),
  status: text("status").notNull().default("stopped"),
  pid: integer("pid"),
  createdAt: timestamp("created_at").defaultNow(),
});
