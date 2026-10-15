import { NextRequest, NextResponse } from "next/server";
import {
  listPurchaseOrders,
  addPurchaseOrder,
} from "@/app/service/purchase-order.service";
import { objectBody, nonnegativeInt, optionalText, positiveId, publicErrorMessage } from "@/app/api/_validation";

export async function GET() {
  try {
    return NextResponse.json({ success: true, data: await listPurchaseOrders() });
  } catch {
    return NextResponse.json(
      { error: "Failed to fetch purchases" },
      { status: 500 },
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = objectBody(await request.json());
    if (!Array.isArray(body.items)) throw new Error("Purchase items are required");
    const purchase = await addPurchaseOrder({
      supplierId: positiveId(body.supplierId, "Supplier"),
      notes: optionalText(body.notes, "Notes", 2000),
      items: body.items.map((raw) => {
        const item = objectBody(raw);
        return { productId: positiveId(item.productId, "Product"), quantity: nonnegativeInt(item.quantity, "Quantity"), unitCost: typeof item.unitCost === "string" || typeof item.unitCost === "number" ? item.unitCost : "" };
      }),
    });

    return NextResponse.json({ success: true, data: purchase }, { status: 201 });
  } catch (error) {
    const message = error instanceof Error && !("code" in error) ? error.message : "Purchase creation failed. Verify the supplier and products still exist.";
    return NextResponse.json({ success: false, message: publicErrorMessage(error, message) }, { status: error instanceof Error && error.name === "InputError" ? 400 : error instanceof Error && !("code" in error) ? 400 : 409 });
  }
}
