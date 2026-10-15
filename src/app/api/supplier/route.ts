import { NextRequest, NextResponse } from "next/server";
import {
  listSuppliers,
  addSupplier,
} from "@/app/service/supplier.service";
import { objectBody, optionalEmail, optionalText, publicErrorMessage, requiredText } from "@/app/api/_validation";

export async function GET() {
  try {
    return NextResponse.json({ success: true, data: await listSuppliers() });
  } catch (error) {
    console.error("Fetch suppliers failed", error);
    return NextResponse.json(
      { success: false, message: "Failed to fetch suppliers" },
      { status: 500 },
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = objectBody(await request.json());
    const supplier = await addSupplier({ name: requiredText(body.name, "Supplier name", 180), email: optionalEmail(body.email), phone: optionalText(body.phone, "Phone", 80), address: optionalText(body.address, "Address", 1000) });

    return NextResponse.json({ success: true, data: supplier }, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        message: publicErrorMessage(error, "Failed to create supplier"),
      },
      { status: error instanceof Error && error.name === "InputError" ? 400 : error instanceof Error && !("code" in error) ? 400 : 500 },
    );
  }
}
