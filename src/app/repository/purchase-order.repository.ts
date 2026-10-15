import { db } from "@/db";
import { inventory, products, purchaseItems, purchaseOrders, suppliers } from "@/db/schema";
import { and, desc, eq, inArray, sql } from "drizzle-orm";

export async function getAllPurchaseOrders() {
  return db.select({ id: purchaseOrders.id, supplierId: purchaseOrders.supplierId, supplierName: suppliers.name, status: purchaseOrders.status, totalAmount: purchaseOrders.totalAmount, notes: purchaseOrders.notes, createdAt: purchaseOrders.createdAt, updatedAt: purchaseOrders.updatedAt })
    .from(purchaseOrders).innerJoin(suppliers, eq(purchaseOrders.supplierId, suppliers.id)).orderBy(desc(purchaseOrders.createdAt));
}

export async function getPurchaseOrderById(id: number) {
  const [purchase] = await db.select().from(purchaseOrders).where(eq(purchaseOrders.id, id)).limit(1);
  return purchase ?? null;
}

export async function createPurchaseOrder(data: { supplierId: number; notes: string | null; totalAmount: string; items: { productId: number; quantity: number; unitCost: string; subtotal: string }[] }) {
  return db.transaction(async (tx) => {
    const [supplier] = await tx.select({ id: suppliers.id }).from(suppliers).where(eq(suppliers.id, data.supplierId)).limit(1);
    if (!supplier) throw new Error("Supplier not found");
    const ids = [...new Set(data.items.map((item) => item.productId))];
    const found = ids.length ? await tx.select({ id: products.id }).from(products).where(inArray(products.id, ids)) : [];
    if (found.length !== ids.length) throw new Error("One or more selected products do not exist");
    const [purchase] = await tx.insert(purchaseOrders).values({ supplierId: data.supplierId, notes: data.notes, status: "pending", totalAmount: data.totalAmount }).returning();
    await tx.insert(purchaseItems).values(data.items.map((item) => ({ ...item, purchaseOrderId: purchase.id })));
    return purchase;
  });
}

export async function updatePendingPurchase(id: number, data: { notes?: string | null }) {
  return db.transaction(async (tx) => {
    const [locked] = await tx.select().from(purchaseOrders).where(eq(purchaseOrders.id, id)).for("update");
    if (!locked) throw new Error("Purchase order not found");
    if (locked.status !== "pending") throw new Error("Only pending purchases can be edited");
    const [purchase] = await tx.update(purchaseOrders).set({ ...data, updatedAt: new Date() }).where(and(eq(purchaseOrders.id, id), eq(purchaseOrders.status, "pending"))).returning();
    if (!purchase) throw new Error("Purchase order is no longer pending");
    return purchase;
  });
}

export async function deletePendingPurchase(id: number) {
  return db.transaction(async (tx) => {
    const [locked] = await tx.select().from(purchaseOrders).where(eq(purchaseOrders.id, id)).for("update");
    if (!locked) throw new Error("Purchase order not found");
    if (locked.status !== "pending") throw new Error("Only pending purchases can be deleted");
    const [purchase] = await tx.delete(purchaseOrders).where(and(eq(purchaseOrders.id, id), eq(purchaseOrders.status, "pending"))).returning();
    if (!purchase) throw new Error("Purchase order is no longer pending");
    return purchase;
  });
}

export async function cancelPendingPurchase(id: number) {
  return db.transaction(async (tx) => {
    const [locked] = await tx.select().from(purchaseOrders).where(eq(purchaseOrders.id, id)).for("update");
    if (!locked) throw new Error("Purchase order not found");
    if (locked.status !== "pending") throw new Error("Only pending purchases can be cancelled");
    const [purchase] = await tx.update(purchaseOrders).set({ status: "cancelled", updatedAt: new Date() }).where(and(eq(purchaseOrders.id, id), eq(purchaseOrders.status, "pending"))).returning();
    if (!purchase) throw new Error("Purchase order is no longer pending");
    return purchase;
  });
}

export async function receivePendingPurchase(id: number) {
  return db.transaction(async (tx) => {
    const [purchase] = await tx.select().from(purchaseOrders).where(eq(purchaseOrders.id, id)).for("update");
    if (!purchase) throw new Error("Purchase order not found");
    if (purchase.status !== "pending") throw new Error("Only pending purchases can be received");
    const items = await tx.select().from(purchaseItems).where(eq(purchaseItems.purchaseOrderId, id));
    if (items.length === 0) throw new Error("Cannot receive a purchase without items");
    for (const item of items) {
      const [updated] = await tx.update(inventory).set({ quantity: sql`${inventory.quantity} + ${item.quantity}`, updatedAt: new Date() })
        .where(and(eq(inventory.productId, item.productId), sql`${inventory.quantity} <= ${2147483647 - item.quantity}`)).returning({ id: inventory.id });
      if (!updated) {
        const [record] = await tx.select({ id: inventory.id }).from(inventory).where(eq(inventory.productId, item.productId)).limit(1);
        if (!record) throw new Error(`Inventory record missing for product ${item.productId}`);
        throw new Error(`Receiving would exceed the maximum stock quantity for product ${item.productId}`);
      }
    }
    const [received] = await tx.update(purchaseOrders).set({ status: "received", updatedAt: new Date() }).where(and(eq(purchaseOrders.id, id), eq(purchaseOrders.status, "pending"))).returning();
    if (!received) throw new Error("Purchase is no longer pending");
    return received;
  });
}
