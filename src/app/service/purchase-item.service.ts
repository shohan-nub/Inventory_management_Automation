import { createPurchaseItem, deletePurchaseItem, getItemsByPurchaseOrderId, updatePurchaseItem } from "@/app/repository/purchase-item.repository";
import { getPurchaseOrderById } from "@/app/repository/purchase-order.repository";
import { money, toCents } from "@/app/service/purchase-order.service";

async function validateParent(purchaseOrderId: number) {
  if (!Number.isSafeInteger(purchaseOrderId) || purchaseOrderId <= 0) throw new Error("Invalid purchase order ID");
  const purchase = await getPurchaseOrderById(purchaseOrderId);
  if (!purchase) throw new Error("Purchase order not found");
  return purchase;
}

export async function listPurchaseItems(purchaseOrderId: number) {
  await validateParent(purchaseOrderId);
  return getItemsByPurchaseOrderId(purchaseOrderId);
}

function lineValues(quantity: number, unitCost: string | number) {
  if (!Number.isSafeInteger(quantity) || quantity <= 0 || quantity > 2147483647) throw new Error("Quantity must be a valid positive whole number");
  const unitCents = toCents(unitCost);
  const subtotal = unitCents * BigInt(quantity);
  if (subtotal > BigInt("999999999999")) throw new Error("Item subtotal exceeds the supported range");
  return { quantity, unitCost: money(unitCents), subtotal: money(subtotal) };
}

export async function addPurchaseItem(data: { purchaseOrderId: number; productId: number; quantity: number; unitCost: string | number }) {
  if (!Number.isSafeInteger(data.productId) || data.productId <= 0) throw new Error("Invalid product ID");
  const values = lineValues(data.quantity, data.unitCost);
  return createPurchaseItem({ ...data, ...values });
}

export async function editPurchaseItem(id: number, purchaseOrderId: number, data: { quantity: number; unitCost: string | number }) {
  if (!Number.isSafeInteger(id) || id <= 0) throw new Error("Invalid purchase item ID");
  const values = lineValues(data.quantity, data.unitCost);
  return updatePurchaseItem(id, purchaseOrderId, values);
}

export async function removePurchaseItem(id: number, purchaseOrderId: number) {
  if (!Number.isSafeInteger(id) || id <= 0) throw new Error("Invalid purchase item ID");
  await validateParent(purchaseOrderId);
  return deletePurchaseItem(id, purchaseOrderId);
}
