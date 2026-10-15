import { NextRequest, NextResponse } from "next/server";
import {
  listPurchaseItems,
  addPurchaseItem,
} from "@/app/service/purchase-item.service";
import { objectBody, nonnegativeInt, positiveId, publicErrorMessage } from "@/app/api/_validation";

type Context = {
  params: Promise<{ id: string }>;
};

export async function GET(
  _request: NextRequest,
  { params }: Context,
) {
  try {
    const { id } = await params;
    const purchaseId = Number(id);

    if (!Number.isInteger(purchaseId) || purchaseId <= 0) {
      return NextResponse.json({ error: "Invalid purchase ID" }, { status: 400 });
    }

    return NextResponse.json({ success: true, data: await listPurchaseItems(purchaseId) });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: error instanceof Error ? error.message : "Failed to fetch items" },
      { status: error instanceof Error && error.message.includes("not found") ? 404 : 400 },
    );
  }
}

export async function POST(
  request: NextRequest,
  { params }: Context,
) {
  try {
    const { id } = await params;
    const purchaseOrderId = Number(id);

    if (!Number.isInteger(purchaseOrderId) || purchaseOrderId <= 0) {
      return NextResponse.json({ error: "Invalid purchase ID" }, { status: 400 });
    }

    const body = objectBody(await request.json());

    const item = await addPurchaseItem({
      purchaseOrderId,
      productId: positiveId(body.productId, "Product"),
      quantity: nonnegativeInt(body.quantity, "Quantity"),
      unitCost: typeof body.unitCost === "string" || typeof body.unitCost === "number" ? body.unitCost : "",
    });

    return NextResponse.json({ success: true, data: item }, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: publicErrorMessage(error, "Failed to add purchase item") },
      { status: error instanceof Error && error.message.includes("not found") ? 404 : error instanceof Error && !("code" in error) ? 400 : 500 },
    );
  }
}
