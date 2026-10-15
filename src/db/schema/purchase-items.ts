import {
  pgTable,
  serial,
  integer,
  numeric,
  timestamp,
} from "drizzle-orm/pg-core";

import { purchaseOrders } from "./purchase-orders";
import { products } from "./products";

export const purchaseItems = pgTable("purchase_items", {
  id: serial("id").primaryKey(),

  purchaseOrderId: integer("purchase_order_id")
    .notNull()
    .references(() => purchaseOrders.id, {
      onDelete: "cascade",
    }),

  productId: integer("product_id")
    .notNull()
    .references(() => products.id),

  quantity: integer("quantity").notNull(),

  unitCost: numeric("unit_cost", {
    precision: 10,
    scale: 2,
  }).notNull(),

  subtotal: numeric("subtotal", {
    precision: 12,
    scale: 2,
  }).notNull(),

  createdAt: timestamp("created_at")
    .defaultNow()
    .notNull(),
});