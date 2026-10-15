import { db } from "@/db";
import { products, purchaseItems, purchaseOrders } from "@/db/schema";
import { and, eq, sql } from "drizzle-orm";

export async function getItemsByPurchaseOrderId(purchaseOrderId: number) {
  return db.select({ id: purchaseItems.id, purchaseOrderId: purchaseItems.purchaseOrderId, productId: purchaseItems.productId, productName: products.name, sku: products.sku, quantity: purchaseItems.quantity, unitCost: purchaseItems.unitCost, subtotal: purchaseItems.subtotal, createdAt: purchaseItems.createdAt })
    .from(purchaseItems).innerJoin(products, eq(purchaseItems.productId, products.id)).where(eq(purchaseItems.purchaseOrderId, purchaseOrderId));
}

async function recalculateTotal(tx: Parameters<Parameters<typeof db.transaction>[0]>[0], purchaseOrderId: number) {
  const [total] = await tx.select({ value: sql<string>`coalesce(sum(${purchaseItems.subtotal}), 0)` }).from(purchaseItems).where(eq(purchaseItems.purchaseOrderId, purchaseOrderId));
  await tx.update(purchaseOrders).set({ totalAmount: total.value, updatedAt: new Date() }).where(and(eq(purchaseOrders.id, purchaseOrderId), eq(purchaseOrders.status, "pending")));
}

async function lockPendingPurchase(tx: Parameters<Parameters<typeof db.transaction>[0]>[0], id: number) {
  const [purchase] = await tx.select().from(purchaseOrders).where(eq(purchaseOrders.id, id)).for("update");
  if (!purchase) throw new Error("Purchase order not found");
  if (purchase.status !== "pending") throw new Error("Items can only be changed on pending purchases");
  return purchase;
}

export async function createPurchaseItem(data: { purchaseOrderId: number; productId: number; quantity: number; unitCost: string; subtotal: string }) {
  return db.transaction(async (tx) => {
    await lockPendingPurchase(tx, data.purchaseOrderId);
    const [product] = await tx.select({ id: products.id }).from(products).where(eq(products.id, data.productId)).limit(1);
    if (!product) throw new Error("Product not found");
    const [item] = await tx.insert(purchaseItems).values(data).returning();
    await recalculateTotal(tx, data.purchaseOrderId);
    return item;
  });
}

export async function updatePurchaseItem(id: number, purchaseOrderId: number, data: { quantity: number; unitCost: string; subtotal: string }) {
  return db.transaction(async (tx) => {
    await lockPendingPurchase(tx, purchaseOrderId);
    const [item] = await tx.update(purchaseItems).set(data).where(and(eq(purchaseItems.id, id), eq(purchaseItems.purchaseOrderId, purchaseOrderId))).returning();
    if (!item) throw new Error("Purchase item not found");
    await recalculateTotal(tx, purchaseOrderId);
    return item;
  });
}

export async function deletePurchaseItem(id: number, purchaseOrderId: number) {
  return db.transaction(async (tx) => {
    await lockPendingPurchase(tx, purchaseOrderId);
    const [item] = await tx.delete(purchaseItems).where(and(eq(purchaseItems.id, id), eq(purchaseItems.purchaseOrderId, purchaseOrderId))).returning();
    if (!item) throw new Error("Purchase item not found");
    await recalculateTotal(tx, purchaseOrderId);
    return item;
  });
}
