import {
  pgTable,
  serial,
  integer,
  text,
  numeric,
  timestamp,
} from "drizzle-orm/pg-core";

import { suppliers } from "./suppliers";

export const purchaseOrders = pgTable("purchase_orders", {
  id: serial("id").primaryKey(),

  supplierId: integer("supplier_id")
    .notNull()
    .references(() => suppliers.id),

  status: text("status")
    .notNull()
    .default("pending"),

  totalAmount: numeric("total_amount", {
    precision: 12,
    scale: 2,
  })
    .notNull()
    .default("0"),

  notes: text("notes"),

  createdAt: timestamp("created_at")
    .defaultNow()
    .notNull(),

  updatedAt: timestamp("updated_at")
    .defaultNow()
    .notNull(),
});