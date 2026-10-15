import { NextRequest, NextResponse } from "next/server";
import { categoryService } from "@/app/service/category.service";
import { errorResponse, objectBody, optionalText, requiredText } from "@/app/api/_validation";

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function GET(
  _request: NextRequest,
  { params }: RouteContext,
) {
  try {
    const { id } = await params;
    const categoryId = Number(id);

    if (!Number.isInteger(categoryId) || categoryId <= 0) {
      return NextResponse.json(
        { success: false, message: "Invalid category ID" },
        { status: 400 },
      );
    }

    const category = await categoryService.findById(categoryId);

    if (!category) {
      return NextResponse.json(
        { success: false, message: "Category not found" },
        { status: 404 },
      );
    }

    return NextResponse.json({ success: true, data: category });
  } catch (error) {
    console.error("Get category error:", error);

    return NextResponse.json(
      { success: false, message: "Failed to fetch category" },
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
    const categoryId = Number(id);

    if (!Number.isInteger(categoryId) || categoryId <= 0) {
      return NextResponse.json(
        { success: false, message: "Invalid category ID" },
        { status: 400 },
      );
    }

    const body = objectBody(await request.json());
    const category = await categoryService.update(categoryId, {
      ...(body.name !== undefined ? { name: requiredText(body.name, "Category name", 180) } : {}),
      ...(body.description !== undefined ? { description: optionalText(body.description, "Description", 2000) } : {}),
    });

    if (!category) {
      return NextResponse.json(
        { success: false, message: "Category not found" },
        { status: 404 },
      );
    }

    return NextResponse.json({ success: true, data: category });
  } catch (error) {
    return errorResponse(error, "Failed to update category");
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: RouteContext,
) {
  try {
    const { id } = await params;
    const categoryId = Number(id);

    if (!Number.isInteger(categoryId) || categoryId <= 0) {
      return NextResponse.json(
        { success: false, message: "Invalid category ID" },
        { status: 400 },
      );
    }

    const category = await categoryService.delete(categoryId);

    if (!category) {
      return NextResponse.json(
        { success: false, message: "Category not found" },
        { status: 404 },
      );
    }

    return NextResponse.json({
      success: true,
      message: "Category deleted successfully",
      data: category,
    });
  } catch (error) {
    const referenced = isForeignKeyViolation(error);
    if (!referenced) console.error("Delete category error:", error);
    return NextResponse.json({ success: false, message: referenced ? "This category contains products. Move or delete those products before deleting the category." : "Failed to delete category" }, { status: referenced ? 409 : 500 });
  }
}

function isForeignKeyViolation(error: unknown): boolean {
  let current: unknown = error;
  for (let depth = 0; depth < 4 && current && typeof current === "object"; depth++) {
    if ("code" in current && current.code === "23503") return true;
    current = "cause" in current ? current.cause : null;
  }
  return false;
}
