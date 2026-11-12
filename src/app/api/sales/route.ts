import { NextRequest, NextResponse } from "next/server";
import {
  listSalesOrders,
  addSalesOrder,
} from "@/app/service/sales-order.service";

export async function GET() {
  try {
    return NextResponse.json({
      success: true,
      data: await listSalesOrders(),
    });
  } catch {
    return NextResponse.json(
      { success: false, message: "Failed to fetch sales orders" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const order = await addSalesOrder({
      customerId: Number(body.customerId),
    });

    return NextResponse.json(
      { success: true, data: order },
      { status: 201 }
    );
  } catch (error) {
    return NextResponse.json(
      { success: false, message: error instanceof Error ? error.message : "Failed to create sales order" },
      { status: 400 }
    );
  }
}