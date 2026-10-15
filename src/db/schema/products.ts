import {
  pgTable,
  serial,
  text,
  integer,
  numeric,
  timestamp,
} from "drizzle-orm/pg-core";

import { categories } from "./categories";

export const products = pgTable("products", {
  id: serial("id").primaryKey(),

  categoryId: integer("category_id")
    .notNull()
    .references(() => categories.id),

  name: text("name").notNull(),

  description: text("description"),

  sku: text("sku").notNull().unique(),

  price: numeric("price", {
    precision: 10,
    scale: 2,
  }).notNull(),

  createdAt: timestamp("created_at").defaultNow().notNull(),

  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});