import { NextResponse } from "next/server";
import { cancelPurchaseOrder } from "@/app/service/purchase-order.service";
import { publicErrorMessage } from "@/app/api/_validation";

type Context = { params: Promise<{ id: string }> };
export async function PATCH(_request: Request, { params }: Context) {
  const { id: value } = await params;
  const id = Number(value);
  if (!Number.isSafeInteger(id) || id <= 0) return NextResponse.json({ success: false, message: "Invalid purchase ID" }, { status: 400 });
  try { return NextResponse.json({ success: true, data: await cancelPurchaseOrder(id) }); }
  catch (error) {
    const message = publicErrorMessage(error, "Failed to cancel purchase");
    return NextResponse.json({ success: false, message }, { status: message.includes("not found") ? 404 : 409 });
  }
}
