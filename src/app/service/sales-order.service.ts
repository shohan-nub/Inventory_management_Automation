import {
  getAllSalesOrders,
  getSalesOrderById,
  createSalesOrder,
  confirmSalesOrder,
  cancelSalesOrder,
} from "@/app/repository/sales-order.repository";

export async function listSalesOrders() {
  return getAllSalesOrders();
}

export async function findSalesOrder(id: number) {
  if (!Number.isSafeInteger(id) || id <= 0) {
    throw new Error("Invalid sales order ID");
  }

  const order = await getSalesOrderById(id);

  if (!order) throw new Error("Sales order not found");

  return order;
}

export async function addSalesOrder(data: {
  customerId: number;
}) {
  if (!Number.isSafeInteger(data.customerId) || data.customerId <= 0) {
    throw new Error("A valid customer is required");
  }

  return createSalesOrder(data.customerId);
}

export async function completeSalesOrder(id: number) {
  if (!Number.isSafeInteger(id) || id <= 0) {
    throw new Error("Invalid sales order ID");
  }

  return confirmSalesOrder(id);
}

export async function cancelSalesOrderById(id: number) {
  if (!Number.isSafeInteger(id) || id <= 0) {
    throw new Error("Invalid sales order ID");
  }

  return cancelSalesOrder(id);
}