import { NextRequest, NextResponse } from "next/server";
import { inventoryService } from "@/app/service/inventory.service";
import { errorResponse, nonnegativeInt, objectBody, positiveId } from "@/app/api/_validation";

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function GET(
  _request: NextRequest,
  { params }: RouteContext,
) {
  try {
    const { id } = await params;
    const inventoryId = Number(id);

    if (!Number.isInteger(inventoryId) || inventoryId <= 0) {
      return NextResponse.json(
        { success: false, message: "Invalid inventory ID" },
        { status: 400 },
      );
    }

    const item = await inventoryService.findById(inventoryId);

    if (!item) {
      return NextResponse.json(
        { success: false, message: "Inventory item not found" },
        { status: 404 },
      );
    }

    return NextResponse.json({ success: true, data: item });
  } catch (error) {
    console.error("Get inventory error:", error);

    return NextResponse.json(
      { success: false, message: "Failed to fetch inventory item" },
      { status: 500 },
    );
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: RouteContext,
) {
  try {
    const { id } = await params;
    const inventoryId = Number(id);

    if (!Number.isInteger(inventoryId) || inventoryId <= 0) {
      return NextResponse.json(
        { success: false, message: "Invalid inventory ID" },
        { status: 400 },
      );
    }

    const body = objectBody(await request.json());
    const item = await inventoryService.update(inventoryId, {
      ...(body.productId !== undefined ? { productId: positiveId(body.productId, "Product") } : {}),
      ...(body.quantity !== undefined ? { quantity: nonnegativeInt(body.quantity, "Quantity") } : {}),
      ...(body.reorderLevel !== undefined ? { reorderLevel: nonnegativeInt(body.reorderLevel, "Reorder level") } : {}),
    });

    if (!item) {
      return NextResponse.json(
        { success: false, message: "Inventory item not found" },
        { status: 404 },
      );
    }

    return NextResponse.json({ success: true, data: item });
  } catch (error) {
    return errorResponse(error, "Failed to update inventory item", { "23505": "This product already has an inventory record.", "23503": "The selected product does not exist." });
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: RouteContext,
) {
  try {
    const { id } = await params;
    const inventoryId = Number(id);

    if (!Number.isInteger(inventoryId) || inventoryId <= 0) {
      return NextResponse.json(
        { success: false, message: "Invalid inventory ID" },
        { status: 400 },
      );
    }

    const item = await inventoryService.delete(inventoryId);

    if (!item) {
      return NextResponse.json(
        { success: false, message: "Inventory item not found" },
        { status: 404 },
      );
    }

    return NextResponse.json({
      success: true,
      message: "Inventory item deleted successfully",
      data: item,
    });
  } catch (error) {
    console.error("Delete inventory error:", error);

    return NextResponse.json(
      { success: false, message: "Failed to delete inventory item" },
      { status: 500 },
    );
  }
}
