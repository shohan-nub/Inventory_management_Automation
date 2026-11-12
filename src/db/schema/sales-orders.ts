import {
  pgTable,
  serial,
  integer,
  numeric,
  text,
  timestamp,
} from "drizzle-orm/pg-core";

import { customers } from "./customers";

export const salesOrders = pgTable("sales_orders", {
  id: serial("id").primaryKey(),

  customerId: integer("customer_id")
    .notNull()
    .references(() => customers.id),

  status: text("status").notNull().default("pending"),

  subtotal: numeric("subtotal", {
    precision: 10,
    scale: 2,
  }).notNull().default("0"),

  discount: numeric("discount", {
    precision: 10,
    scale: 2,
  }).notNull().default("0"),

  totalAmount: numeric("total_amount", {
    precision: 10,
    scale: 2,
  }).notNull().default("0"),

  createdAt: timestamp("created_at").defaultNow().notNull(),

  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});