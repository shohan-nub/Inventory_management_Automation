import { NextRequest, NextResponse } from "next/server";
import {
  findPurchaseOrder,
  editPurchaseOrder,
  removePurchaseOrder,
} from "@/app/service/purchase-order.service";
import { objectBody, optionalText, publicErrorMessage } from "@/app/api/_validation";
import { findSupplier } from "@/app/service/supplier.service";

type Context = {
  params: Promise<{ id: string }>;
};

function parseId(value: string) {
  const id = Number(value);
  return Number.isInteger(id) && id > 0 ? id : null;
}

export async function GET(
  _request: NextRequest,
  { params }: Context,
) {
  try {
    const { id: value } = await params;
    const id = parseId(value);

    if (!id) {
      return NextResponse.json({ error: "Invalid ID" }, { status: 400 });
    }

    const purchase = await findPurchaseOrder(id);
    const supplier = await findSupplier(purchase.supplierId);
    return NextResponse.json({ success: true, data: { ...purchase, supplierName: supplier.name } });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: error instanceof Error && error.message.includes("not found") ? error.message : publicErrorMessage(error, "Failed to fetch purchase") },
      { status: error instanceof Error && error.message.includes("not found") ? 404 : 500 },
    );
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: Context,
) {
  try {
    const { id: value } = await params;
    const id = parseId(value);

    if (!id) {
      return NextResponse.json({ error: "Invalid ID" }, { status: 400 });
    }

    const body = objectBody(await request.json());
    const purchase = await editPurchaseOrder(id, { ...(body.notes !== undefined ? { notes: optionalText(body.notes, "Notes", 2000) } : {}) });
    return NextResponse.json({ success: true, data: purchase });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: publicErrorMessage(error, "Failed to update purchase") },
      { status: error instanceof Error && error.message.includes("not found") ? 404 : error instanceof Error && !("code" in error) ? 409 : 500 },
    );
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: Context,
) {
  try {
    const { id: value } = await params;
    const id = parseId(value);

    if (!id) {
      return NextResponse.json({ error: "Invalid ID" }, { status: 400 });
    }

    return NextResponse.json({ success: true, data: await removePurchaseOrder(id) });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: publicErrorMessage(error, "Failed to delete purchase") },
      { status: error instanceof Error && error.message.includes("not found") ? 404 : error instanceof Error && !("code" in error) ? 409 : 500 },
    );
  }
}
