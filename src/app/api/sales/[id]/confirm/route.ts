import { NextRequest, NextResponse } from "next/server";
import { completeSalesOrder } from "@/app/service/sales-order.service";

type Context = {
  params: Promise<{ id: string }>;
};

export async function POST(
  _request: NextRequest,
  { params }: Context
) {
  try {
    const { id: value } = await params;
    const id = Number(value);

    if (!Number.isSafeInteger(id) || id <= 0) {
      return NextResponse.json({ message: "Invalid ID" }, { status: 400 });
    }

    const order = await completeSalesOrder(id);

    return NextResponse.json({
      success: true,
      message: "Sale confirmed successfully",
      data: order,
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: error instanceof Error ? error.message : "Failed to confirm sale" },
      { status: 400 }
    );
  }
}