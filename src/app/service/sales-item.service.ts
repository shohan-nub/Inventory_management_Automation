
import {
  getSalesItems,
  createSalesItem,
  updateSalesItem,
  deleteSalesItem,
} from "@/app/repository/sales-item.repository";

function toCents(value: string | number): bigint {
  const text = String(value);

  if (!/^\d{1,8}(\.\d{1,2})?$/.test(text)) {
    throw new Error("Invalid price");
  }

  const [whole, fraction = ""] = text.split(".");

  return (
    BigInt(whole) * BigInt(100) +
    BigInt((fraction + "00").slice(0, 2))
  );
}

function money(cents: bigint) {
  return `${cents / BigInt(100)}.${String(
    cents % BigInt(100)
  ).padStart(2, "0")}`;
}

function validateLine(quantity: number, unitPrice: string | number) {
  if (
    !Number.isSafeInteger(quantity) ||
    quantity <= 0 ||
    quantity > 2147483647
  ) {
    throw new Error("Quantity must be a positive whole number");
  }

  const priceCents = toCents(unitPrice);
  const subtotalCents = priceCents * BigInt(quantity);

  if (subtotalCents > BigInt("9999999999")) {
    throw new Error("Subtotal exceeds supported range");
  }

  return {
    quantity,
    unitPrice: money(priceCents),
    subtotal: money(subtotalCents),
  };
}

export async function listSalesItems(salesOrderId: number) {
  if (!Number.isSafeInteger(salesOrderId) || salesOrderId <= 0) {
    throw new Error("Invalid sales order ID");
  }

  return getSalesItems(salesOrderId);
}

export async function addSalesItem(data: {
  salesOrderId: number;
  productId: number;
  quantity: number;
  unitPrice: string | number;
}) {
  if (
    !Number.isSafeInteger(data.salesOrderId) ||
    data.salesOrderId <= 0
  ) {
    throw new Error("Invalid sales order ID");
  }

  if (
    !Number.isSafeInteger(data.productId) ||
    data.productId <= 0
  ) {
    throw new Error("Invalid product ID");
  }

  const values = validateLine(data.quantity, data.unitPrice);

  return createSalesItem({
    salesOrderId: data.salesOrderId,
    productId: data.productId,
    ...values,
  });
}

export async function editSalesItem(
  id: number,
  salesOrderId: number,
  data: {
    quantity: number;
    unitPrice: string | number;
  }
) {
  if (!Number.isSafeInteger(id) || id <= 0) {
    throw new Error("Invalid sales item ID");
  }

  const values = validateLine(data.quantity, data.unitPrice);

  return updateSalesItem(id, salesOrderId, values);
}

export async function removeSalesItem(
  id: number,
  salesOrderId: number
) {
  if (!Number.isSafeInteger(id) || id <= 0) {
    throw new Error("Invalid sales item ID");
  }

  return deleteSalesItem(id, salesOrderId);
}