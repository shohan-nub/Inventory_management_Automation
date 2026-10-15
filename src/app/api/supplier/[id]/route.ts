import { NextRequest, NextResponse } from "next/server";
import {
  findSupplier,
  editSupplier,
  removeSupplier,
} from "@/app/service/supplier.service";
import { objectBody, optionalEmail, optionalText, publicErrorMessage, requiredText } from "@/app/api/_validation";

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

    return NextResponse.json({ success: true, data: await findSupplier(id) });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: error instanceof Error && error.message === "Supplier not found" ? error.message : "Failed to fetch supplier" },
      { status: error instanceof Error && error.message === "Supplier not found" ? 404 : 400 },
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
    const supplier = await editSupplier(id, {
      ...(body.name !== undefined ? { name: requiredText(body.name, "Supplier name", 180) } : {}),
      ...(body.email !== undefined ? { email: optionalEmail(body.email) } : {}),
      ...(body.phone !== undefined ? { phone: optionalText(body.phone, "Phone", 80) } : {}),
      ...(body.address !== undefined ? { address: optionalText(body.address, "Address", 1000) } : {}),
    });
    return NextResponse.json({ success: true, data: supplier });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: publicErrorMessage(error, "Failed to update supplier") },
      { status: error instanceof Error && error.name === "InputError" ? 400 : error instanceof Error && !("code" in error) ? 400 : 500 },
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

    return NextResponse.json({ success: true, data: await removeSupplier(id) });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: error instanceof Error && error.message === "Supplier not found" ? error.message : error instanceof Error && "code" in error && error.code === "23503" ? "Supplier has purchase records and cannot be deleted." : "Failed to delete supplier" },
      { status: error instanceof Error && error.message === "Supplier not found" ? 404 : error instanceof Error && "code" in error && error.code === "23503" ? 409 : 500 },
    );
  }
}
