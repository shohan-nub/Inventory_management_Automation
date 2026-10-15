import { NextRequest, NextResponse } from "next/server";
import { productService } from "@/app/service/product.service";
import { errorResponse, objectBody, optionalText, positiveId, requiredText, validPrice } from "@/app/api/_validation";

export async function GET() {
  try {
    const products = await productService.findAll();

    return NextResponse.json({
      success: true,
      data: products,
    });
  } catch (error) {
    console.error("Get products error:", error);

    return NextResponse.json(
      { success: false, message: "Failed to fetch products" },
      { status: 500 },
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = objectBody(await request.json());
    const product = await productService.create({
      categoryId: positiveId(body.categoryId, "Category"),
      name: requiredText(body.name, "Product name", 180),
      sku: requiredText(body.sku, "SKU", 100),
      description: optionalText(body.description, "Description", 2000),
      price: validPrice(body.price),
    });

    return NextResponse.json(
      {
        success: true,
        data: product,
      },
      { status: 201 },
    );
  } catch (error) {
    return errorResponse(error, "Failed to create product", { "23505": "A product with this SKU already exists.", "23503": "The selected category does not exist." });
  }
}
