import { cancelPendingPurchase, createPurchaseOrder, deletePendingPurchase, getAllPurchaseOrders, getPurchaseOrderById, receivePendingPurchase, updatePendingPurchase } from "@/app/repository/purchase-order.repository";

export type PurchaseLineInput = { productId: number; quantity: number; unitCost: string | number };
export function toCents(value: string | number) {
  const text = String(value);
  if (!/^\d{1,8}(\.\d{1,2})?$/.test(text)) throw new Error("Unit cost must be a non-negative amount with up to two decimal places");
  const [whole, fraction = ""] = text.split(".");
  const cents = BigInt(whole) * BigInt(100) + BigInt((fraction + "00").slice(0, 2));
  if (cents > BigInt("999999999999")) throw new Error("Unit cost is outside the supported range");
  return cents;
}
export function money(cents: bigint) { return `${cents / BigInt(100)}.${String(cents % BigInt(100)).padStart(2, "0")}`; }
function validatedItems(items: PurchaseLineInput[]) {
  if (!Array.isArray(items) || items.length < 1 || items.length > 100) throw new Error("A purchase must contain between 1 and 100 items");
  return items.map((item) => {
    if (!Number.isSafeInteger(item.productId) || item.productId <= 0 || item.productId > 2147483647) throw new Error("Each item must have a valid product");
    if (!Number.isSafeInteger(item.quantity) || item.quantity <= 0 || item.quantity > 2147483647) throw new Error("Item quantities must be positive whole numbers");
    const unitCents = toCents(item.unitCost);
    const subtotalCents = unitCents * BigInt(item.quantity);
    if (subtotalCents > BigInt("999999999999")) throw new Error("An item subtotal exceeds the supported range");
    return { productId: item.productId, quantity: item.quantity, unitCost: money(unitCents), subtotal: money(subtotalCents) };
  });
}

export const listPurchaseOrders = () => getAllPurchaseOrders();
export async function findPurchaseOrder(id: number) {
  if (!Number.isSafeInteger(id) || id <= 0) throw new Error("Invalid purchase order ID");
  const purchase = await getPurchaseOrderById(id);
  if (!purchase) throw new Error("Purchase order not found");
  return purchase;
}
export async function addPurchaseOrder(data: { supplierId: number; notes?: string | null; items: PurchaseLineInput[] }) {
  if (!Number.isSafeInteger(data.supplierId) || data.supplierId <= 0 || data.supplierId > 2147483647) throw new Error("A valid supplier is required");
  const items = validatedItems(data.items);
  const total = items.reduce((sum, item) => sum + toCents(item.subtotal), BigInt(0));
  if (total > BigInt("999999999999")) throw new Error("Purchase total exceeds the supported range");
  const notes = data.notes?.trim() || null;
  if (notes && notes.length > 2000) throw new Error("Notes must be 2,000 characters or fewer");
  return createPurchaseOrder({ supplierId: data.supplierId, notes, totalAmount: money(total), items });
}
export async function editPurchaseOrder(id: number, data: { notes?: string | null }) {
  if (!Number.isSafeInteger(id) || id <= 0) throw new Error("Invalid purchase order ID");
  if (data.notes !== undefined && data.notes !== null && (typeof data.notes !== "string" || data.notes.length > 2000)) throw new Error("Notes must be 2,000 characters or fewer");
  return updatePendingPurchase(id, { ...(data.notes !== undefined ? { notes: data.notes?.trim() || null } : {}) });
}
export async function removePurchaseOrder(id: number) {
  if (!Number.isSafeInteger(id) || id <= 0) throw new Error("Invalid purchase order ID");
  return deletePendingPurchase(id);
}
export async function cancelPurchaseOrder(id: number) {
  if (!Number.isSafeInteger(id) || id <= 0) throw new Error("Invalid purchase order ID");
  return cancelPendingPurchase(id);
}
export async function receivePurchaseOrder(id: number) {
  if (!Number.isSafeInteger(id) || id <= 0) throw new Error("Invalid purchase order ID");
  return receivePendingPurchase(id);
}
