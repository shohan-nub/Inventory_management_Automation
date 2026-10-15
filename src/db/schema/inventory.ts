import {
  pgTable,
  serial,
  integer,
  timestamp,
} from "drizzle-orm/pg-core";

import { products } from "./products";

export const inventory = pgTable("inventory", {
  id: serial("id").primaryKey(),

  productId: integer("product_id")
    .notNull()
    .unique()
    .references(() => products.id),

  quantity: integer("quantity").notNull().default(0),

  reorderLevel: integer("reorder_level").notNull().default(5),

  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});