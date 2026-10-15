import { NextRequest, NextResponse } from "next/server";
import { productService } from "@/app/service/product.service";
import { errorResponse, objectBody, optionalText, positiveId, requiredText, validPrice } from "@/app/api/_validation";

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function GET(
  _request: NextRequest,
  { params }: RouteContext,
) {
  try {
    const { id } = await params;
    const productId = Number(id);

    if (!Number.isInteger(productId) || productId <= 0) {
      return NextResponse.json(
        { success: false, message: "Invalid product ID" },
        { status: 400 },
      );
    }

    const product = await productService.findById(productId);

    if (!product) {
      return NextResponse.json(
        { success: false, message: "Product not found" },
        { status: 404 },
      );
    }

    return NextResponse.json({ success: true, data: product });
  } catch (error) {
    console.error("Get product error:", error);

    return NextResponse.json(
      { success: false, message: "Failed to fetch product" },
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
    const productId = Number(id);

    if (!Number.isInteger(productId) || productId <= 0) {
      return NextResponse.json(
        { success: false, message: "Invalid product ID" },
        { status: 400 },
      );
    }

    const body = objectBody(await request.json());
    const product = await productService.update(productId, {
      ...(body.name !== undefined ? { name: requiredText(body.name, "Product name", 180) } : {}),
      ...(body.sku !== undefined ? { sku: requiredText(body.sku, "SKU", 100) } : {}),
      ...(body.description !== undefined ? { description: optionalText(body.description, "Description", 2000) } : {}),
      ...(body.categoryId !== undefined ? { categoryId: positiveId(body.categoryId, "Category") } : {}),
      ...(body.price !== undefined ? { price: validPrice(body.price) } : {}),
    });

    if (!product) {
      return NextResponse.json(
        { success: false, message: "Product not found" },
        { status: 404 },
      );
    }

    return NextResponse.json({ success: true, data: product });
  } catch (error) {
    return errorResponse(error, "Failed to update product", { "23505": "A product with this SKU already exists.", "23503": "The selected category does not exist." });
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: RouteContext,
) {
  try {
    const { id } = await params;
    const productId = Number(id);

    if (!Number.isInteger(productId) || productId <= 0) {
      return NextResponse.json(
        { success: false, message: "Invalid product ID" },
        { status: 400 },
      );
    }

    const product = await productService.delete(productId);

    if (!product) {
      return NextResponse.json(
        { success: false, message: "Product not found" },
        { status: 404 },
      );
    }

    return NextResponse.json({
      success: true,
      message: "Product deleted successfully",
      data: product,
    });
  } catch (error) {
    console.error("Delete product error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to delete product. It may be referenced by inventory.",
      },
      { status: 500 },
    );
  }
}
