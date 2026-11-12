import { NextRequest, NextResponse } from "next/server";
import {
  editSalesItem,
  removeSalesItem,
} from "@/app/service/sales-item.service";

type Context = {
  params: Promise<{ id: string; itemId: string }>;
};

export async function PATCH(
  request: NextRequest,
  { params }: Context
) {
  try {
    const { id, itemId } = await params;

    const salesOrderId = Number(id);
    const salesItemId = Number(itemId);

    if (
      !Number.isSafeInteger(salesOrderId) ||
      salesOrderId <= 0 ||
      !Number.isSafeInteger(salesItemId) ||
      salesItemId <= 0
    ) {
      return NextResponse.json({ message: "Invalid ID" }, { status: 400 });
    }

    const body = await request.json();

    const item = await editSalesItem(salesItemId, salesOrderId, {
      quantity: Number(body.quantity),
      unitPrice: body.unitPrice,
    });

    return NextResponse.json({ success: true, data: item });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: error instanceof Error ? error.message : "Failed to update item" },
      { status: 400 }
    );
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: Context
) {
  try {
    const { id, itemId } = await params;

    const salesOrderId = Number(id);
    const salesItemId = Number(itemId);

    if (
      !Number.isSafeInteger(salesOrderId) ||
      salesOrderId <= 0 ||
      !Number.isSafeInteger(salesItemId) ||
      salesItemId <= 0
    ) {
      return NextResponse.json({ message: "Invalid ID" }, { status: 400 });
    }

    return NextResponse.json({
      success: true,
      data: await removeSalesItem(salesItemId, salesOrderId),
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: error instanceof Error ? error.message : "Failed to delete item" },
      { status: 400 }
    );
  }
}