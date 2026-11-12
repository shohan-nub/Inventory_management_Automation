import {
  pgTable,
  serial,
  integer,
  numeric,
  timestamp,
  unique,
} from "drizzle-orm/pg-core";

import { salesOrders } from "./sales-orders";
import { products } from "./products";

export const salesItems = pgTable(
  "sales_items",
  {
    id: serial("id").primaryKey(),

    salesOrderId: integer("sales_order_id")
      .notNull()
      .references(() => salesOrders.id, { onDelete: "cascade" }),

    productId: integer("product_id")
      .notNull()
      .references(() => products.id),

    quantity: integer("quantity").notNull(),

    unitPrice: numeric("unit_price", {
      precision: 10,
      scale: 2,
    }).notNull(),

    subtotal: numeric("subtotal", {
      precision: 10,
      scale: 2,
    }).notNull(),

    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => [
    unique("sales_order_product_unique").on(
      table.salesOrderId,
      table.productId
    ),
  ]
);