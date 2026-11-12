import { NextRequest, NextResponse } from "next/server";
import {
  listCustomers,
  addCustomer,
} from "@/app/service/customer.service";

export async function GET() {
  try {
    return NextResponse.json({
      success: true,
      data: await listCustomers(),
    });
  } catch {
    return NextResponse.json(
      { success: false, message: "Failed to fetch customers" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const customer = await addCustomer({
      name: body.name,
      email: body.email || null,
      phone: body.phone || null,
      address: body.address || null,
    });

    return NextResponse.json(
      { success: true, data: customer },
      { status: 201 }
    );
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        message: error instanceof Error ? error.message : "Failed to create customer",
      },
      { status: 400 }
    );
  }
}