import { NextRequest, NextResponse } from "next/server";
import { editPurchaseItem, removePurchaseItem } from "@/app/service/purchase-item.service";
import { nonnegativeInt, objectBody, publicErrorMessage } from "@/app/api/_validation";

type Context = { params: Promise<{ id: string; itemId: string }> };
function parsed(value: string) { const id = Number(value); return Number.isSafeInteger(id) && id > 0 ? id : null; }

export async function PATCH(request: NextRequest, { params }: Context) {
  const { id: parent, itemId: child } = await params; const purchaseId = parsed(parent); const itemId = parsed(child);
  if (!purchaseId || !itemId) return NextResponse.json({ success: false, message: "Invalid purchase or item ID" }, { status: 400 });
  try {
    const body = objectBody(await request.json());
    const item = await editPurchaseItem(itemId, purchaseId, { quantity: nonnegativeInt(body.quantity, "Quantity"), unitCost: typeof body.unitCost === "string" || typeof body.unitCost === "number" ? body.unitCost : "" });
    return NextResponse.json({ success: true, data: item });
  } catch (error) {
    const message = publicErrorMessage(error, "Failed to update item");
    return NextResponse.json({ success: false, message }, { status: error instanceof Error && error.message.includes("not found") ? 404 : error instanceof Error && error.message.includes("pending") ? 409 : error instanceof Error && !("code" in error) ? 400 : 500 });
  }
}

export async function DELETE(_request: Request, { params }: Context) {
  const { id: parent, itemId: child } = await params; const purchaseId = parsed(parent); const itemId = parsed(child);
  if (!purchaseId || !itemId) return NextResponse.json({ success: false, message: "Invalid purchase or item ID" }, { status: 400 });
  try { return NextResponse.json({ success: true, data: await removePurchaseItem(itemId, purchaseId) }); }
  catch (error) {
    const message = publicErrorMessage(error, "Failed to remove item");
    return NextResponse.json({ success: false, message }, { status: error instanceof Error && error.message.includes("not found") ? 404 : error instanceof Error && error.message.includes("pending") ? 409 : error instanceof Error && !("code" in error) ? 400 : 500 });
  }
}
