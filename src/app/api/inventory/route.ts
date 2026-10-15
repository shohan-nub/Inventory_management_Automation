import { NextRequest, NextResponse } from "next/server";
import { inventoryService } from "@/app/service/inventory.service";
import { errorResponse, nonnegativeInt, objectBody, positiveId } from "@/app/api/_validation";

export async function GET() {
  try {
    const inventory = await inventoryService.findAll();

    return NextResponse.json({
      success: true,
      data: inventory,
    });
  } catch (error) {
    console.error("Get inventory error:", error);

    return NextResponse.json(
      { success: false, message: "Failed to fetch inventory" },
      { status: 500 },
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = objectBody(await request.json());
    const item = await inventoryService.create({ productId: positiveId(body.productId, "Product"), quantity: nonnegativeInt(body.quantity, "Quantity"), reorderLevel: nonnegativeInt(body.reorderLevel, "Reorder level") });

    return NextResponse.json(
      { success: true, data: item },
      { status: 201 },
    );
  } catch (error) {
    return errorResponse(error, "Failed to create inventory item", { "23505": "This product already has an inventory record.", "23503": "The selected product does not exist." });
  }
}
