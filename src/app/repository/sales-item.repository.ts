import { db } from "@/db";
import {
  salesItems,
  salesOrders,
  products,
} from "@/db/schema";
import { eq, and, sql } from "drizzle-orm";

async function recalculateTotal(
  tx: Parameters<Parameters<typeof db.transaction>[0]>[0],
  salesOrderId: number
) {
  const [result] = await tx
    .select({
      subtotal: sql<string>`coalesce(sum(${salesItems.subtotal}), 0)`,
    })
    .from(salesItems)
    .where(eq(salesItems.salesOrderId, salesOrderId));

  await tx
    .update(salesOrders)
    .set({
      subtotal: result.subtotal,
      totalAmount: sql`greatest(${result.subtotal} - ${salesOrders.discount}, 0)`,
      updatedAt: new Date(),
    })
    .where(eq(salesOrders.id, salesOrderId));
}

export async function getSalesItems(salesOrderId: number) {
  return db
    .select({
      id: salesItems.id,
      salesOrderId: salesItems.salesOrderId,
      productId: salesItems.productId,
      productName: products.name,
      sku: products.sku,
      quantity: salesItems.quantity,
      unitPrice: salesItems.unitPrice,
      subtotal: salesItems.subtotal,
    })
    .from(salesItems)
    .innerJoin(products, eq(salesItems.productId, products.id))
    .where(eq(salesItems.salesOrderId, salesOrderId));
}

export async function createSalesItem(data: {
  salesOrderId: number;
  productId: number;
  quantity: number;
  unitPrice: string;
  subtotal: string;
}) {
  return db.transaction(async (tx) => {
    const [order] = await tx
      .select()
      .from(salesOrders)
      .where(eq(salesOrders.id, data.salesOrderId))
      .for("update");

    if (!order) throw new Error("Sales order not found");

    if (order.status !== "pending") {
      throw new Error("Items can only be added to pending orders");
    }

    const [product] = await tx
      .select({ id: products.id })
      .from(products)
      .where(eq(products.id, data.productId))
      .limit(1);

    if (!product) throw new Error("Product not found");

    const [existing] = await tx
      .select({ id: salesItems.id })
      .from(salesItems)
      .where(
        and(
          eq(salesItems.salesOrderId, data.salesOrderId),
          eq(salesItems.productId, data.productId)
        )
      )
      .limit(1);

    if (existing) throw new Error("Product already exists in this sales order");

    const [item] = await tx
      .insert(salesItems)
      .values(data)
      .returning();

    await recalculateTotal(tx, data.salesOrderId);

    return item;
  });
}

export async function updateSalesItem(
  id: number,
  salesOrderId: number,
  data: {
    quantity: number;
    unitPrice: string;
    subtotal: string;
  }
) {
  return db.transaction(async (tx) => {
    const [order] = await tx
      .select()
      .from(salesOrders)
      .where(eq(salesOrders.id, salesOrderId))
      .for("update");

    if (!order || order.status !== "pending") {
      throw new Error("Only pending sales orders can be edited");
    }

    const [item] = await tx
      .update(salesItems)
      .set(data)
      .where(
        and(
          eq(salesItems.id, id),
          eq(salesItems.salesOrderId, salesOrderId)
        )
      )
      .returning();

    if (!item) throw new Error("Sales item not found");

    await recalculateTotal(tx, salesOrderId);

    return item;
  });
}

export async function deleteSalesItem(id: number, salesOrderId: number) {
  return db.transaction(async (tx) => {
    const [order] = await tx
      .select()
      .from(salesOrders)
      .where(eq(salesOrders.id, salesOrderId))
      .for("update");

    if (!order || order.status !== "pending") {
      throw new Error("Only pending sales orders can be edited");
    }

    const [item] = await tx
      .delete(salesItems)
      .where(
        and(
          eq(salesItems.id, id),
          eq(salesItems.salesOrderId, salesOrderId)
        )
      )
      .returning();

    if (!item) throw new Error("Sales item not found");

    await recalculateTotal(tx, salesOrderId);

    return item;
  });
}