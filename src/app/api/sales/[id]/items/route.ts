import { NextRequest, NextResponse } from "next/server";
import {
  listSalesItems,
  addSalesItem,
} from "@/app/service/sales-item.service";

type Context = {
  params: Promise<{ id: string }>;
};

export async function GET(
  _request: NextRequest,
  { params }: Context
) {
  try {
    const { id: value } = await params;
    const id = Number(value);

    if (!Number.isSafeInteger(id) || id <= 0) {
      return NextResponse.json({ message: "Invalid sales order ID" }, { status: 400 });
    }

    return NextResponse.json({
      success: true,
      data: await listSalesItems(id),
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: error instanceof Error ? error.message : "Failed to fetch items" },
      { status: 400 }
    );
  }
}

export async function POST(
  request: NextRequest,
  { params }: Context
) {
  try {
    const { id: value } = await params;
    const id = Number(value);

    if (!Number.isSafeInteger(id) || id <= 0) {
      return NextResponse.json({ message: "Invalid sales order ID" }, { status: 400 });
    }

    const body = await request.json();

    const item = await addSalesItem({
      salesOrderId: id,
      productId: Number(body.productId),
      quantity: Number(body.quantity),
      unitPrice: body.unitPrice,
    });

    return NextResponse.json(
      { success: true, data: item },
      { status: 201 }
    );
  } catch (error) {
    return NextResponse.json(
      { success: false, message: error instanceof Error ? error.message : "Failed to add sales item" },
      { status: 400 }
    );
  }
}