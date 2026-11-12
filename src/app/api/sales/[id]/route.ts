import { NextRequest, NextResponse } from "next/server";
import { findSalesOrder } from "@/app/service/sales-order.service";

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
      return NextResponse.json({ message: "Invalid ID" }, { status: 400 });
    }

    return NextResponse.json({
      success: true,
      data: await findSalesOrder(id),
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: error instanceof Error ? error.message : "Failed to fetch sales order" },
      { status: 404 }
    );
  }
}