import { db } from "@/db";
import {
  salesOrders,
  salesItems,
  customers,
  inventory,
} from "@/db/schema";
import { eq, desc, and, gte, sql } from "drizzle-orm";

export async function getAllSalesOrders() {
  return db
    .select({
      id: salesOrders.id,
      customerId: salesOrders.customerId,
      customerName: customers.name,
      status: salesOrders.status,
      subtotal: salesOrders.subtotal,
      discount: salesOrders.discount,
      totalAmount: salesOrders.totalAmount,
      createdAt: salesOrders.createdAt,
    })
    .from(salesOrders)
    .innerJoin(customers, eq(salesOrders.customerId, customers.id))
    .orderBy(desc(salesOrders.createdAt));
}

export async function getSalesOrderById(id: number) {
  const [order] = await db
    .select()
    .from(salesOrders)
    .where(eq(salesOrders.id, id))
    .limit(1);

  return order ?? null;
}

export async function createSalesOrder(customerId: number) {
  const [customer] = await db
    .select({ id: customers.id })
    .from(customers)
    .where(eq(customers.id, customerId))
    .limit(1);

  if (!customer) throw new Error("Customer not found");

  const [order] = await db
    .insert(salesOrders)
    .values({
      customerId,
      status: "pending",
      subtotal: "0",
      discount: "0",
      totalAmount: "0",
    })
    .returning();

  return order;
}

export async function confirmSalesOrder(id: number) {
  return db.transaction(async (tx) => {
    const [order] = await tx
      .select()
      .from(salesOrders)
      .where(eq(salesOrders.id, id))
      .for("update");

    if (!order) throw new Error("Sales order not found");

    if (order.status !== "pending") {
      throw new Error("Only pending sales orders can be confirmed");
    }

    const items = await tx
      .select()
      .from(salesItems)
      .where(eq(salesItems.salesOrderId, id));

    if (items.length === 0) {
      throw new Error("Cannot confirm an empty sales order");
    }

    for (const item of items) {
      const [updated] = await tx
        .update(inventory)
        .set({
          quantity: sql`${inventory.quantity} - ${item.quantity}`,
          updatedAt: new Date(),
        })
        .where(
          and(
            eq(inventory.productId, item.productId),
            gte(inventory.quantity, item.quantity)
          )
        )
        .returning({ id: inventory.id });

      if (!updated) {
        throw new Error(
          `Insufficient stock or inventory record missing for product ${item.productId}`
        );
      }
    }

    const [confirmed] = await tx
      .update(salesOrders)
      .set({
        status: "completed",
        updatedAt: new Date(),
      })
      .where(
        and(
          eq(salesOrders.id, id),
          eq(salesOrders.status, "pending")
        )
      )
      .returning();

    if (!confirmed) throw new Error("Sales order confirmation failed");

    return confirmed;
  });
}

export async function cancelSalesOrder(id: number) {
  const [order] = await db
    .update(salesOrders)
    .set({
      status: "cancelled",
      updatedAt: new Date(),
    })
    .where(
      and(
        eq(salesOrders.id, id),
        eq(salesOrders.status, "pending")
      )
    )
    .returning();

  if (!order) throw new Error("Pending sales order not found");

  return order;
}