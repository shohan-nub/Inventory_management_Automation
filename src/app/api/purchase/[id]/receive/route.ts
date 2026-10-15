import { NextResponse } from "next/server";
import { receivePurchaseOrder } from "@/app/service/purchase-order.service";
import { publicErrorMessage } from "@/app/api/_validation";

type Context = { params: Promise<{ id: string }> };
export async function PATCH(_request: Request, { params }: Context) {
  const { id: value } = await params;
  const id = Number(value);
  if (!Number.isSafeInteger(id) || id <= 0) return NextResponse.json({ success: false, message: "Invalid purchase ID" }, { status: 400 });
  try {
    const purchase = await receivePurchaseOrder(id);
    return NextResponse.json({ success: true, message: "Purchase received and inventory updated", data: purchase });
  } catch (error) {
    const message = publicErrorMessage(error, "Failed to receive purchase");
    const status = message.includes("not found") ? 404 : message.includes("missing") || message.includes("pending") || message.includes("processed") ? 409 : 400;
    return NextResponse.json({ success: false, message }, { status });
  }
}
