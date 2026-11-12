import { NextRequest, NextResponse } from "next/server";
import {
  findCustomer,
  editCustomer,
  removeCustomer,
} from "@/app/service/customer.service";

type Context = {
  params: Promise<{ id: string }>;
};

function parseId(value: string) {
  const id = Number(value);
  return Number.isSafeInteger(id) && id > 0 ? id : null;
}

export async function GET(
  _request: NextRequest,
  { params }: Context
) {
  try {
    const { id: value } = await params;
    const id = parseId(value);

    if (!id) {
      return NextResponse.json({ message: "Invalid ID" }, { status: 400 });
    }

    return NextResponse.json({
      success: true,
      data: await findCustomer(id),
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: error instanceof Error ? error.message : "Failed to fetch customer" },
      { status: 404 }
    );
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: Context
) {
  try {
    const { id: value } = await params;
    const id = parseId(value);

    if (!id) {
      return NextResponse.json({ message: "Invalid ID" }, { status: 400 });
    }

    const body = await request.json();

    const customer = await editCustomer(id, {
      ...(body.name !== undefined ? { name: body.name } : {}),
      ...(body.email !== undefined ? { email: body.email } : {}),
      ...(body.phone !== undefined ? { phone: body.phone } : {}),
      ...(body.address !== undefined ? { address: body.address } : {}),
    });

    return NextResponse.json({ success: true, data: customer });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: error instanceof Error ? error.message : "Failed to update customer" },
      { status: 400 }
    );
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: Context
) {
  try {
    const { id: value } = await params;
    const id = parseId(value);

    if (!id) {
      return NextResponse.json({ message: "Invalid ID" }, { status: 400 });
    }

    return NextResponse.json({
      success: true,
      data: await removeCustomer(id),
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: error instanceof Error ? error.message : "Failed to delete customer" },
      { status: 400 }
    );
  }
}