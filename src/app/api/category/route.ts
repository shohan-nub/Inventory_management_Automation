import { NextRequest, NextResponse } from "next/server";
import { categoryService } from "@/app/service/category.service";
import { errorResponse, objectBody, optionalText, requiredText } from "@/app/api/_validation";

export async function GET() {
  try {
    const categories = await categoryService.findAll();

    return NextResponse.json({
      success: true,
      data: categories,
    });
  } catch (error) {
    console.error("Get categories error:", error);

    return NextResponse.json(
      { success: false, message: "Failed to fetch categories" },
      { status: 500 },
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = objectBody(await request.json());
    const category = await categoryService.create({ name: requiredText(body.name, "Category name", 180), description: optionalText(body.description, "Description", 2000) });

    return NextResponse.json(
      { success: true, data: category },
      { status: 201 },
    );
  } catch (error) {
    return errorResponse(error, "Failed to create category");
  }
}
