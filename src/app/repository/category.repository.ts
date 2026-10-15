import { db } from "@/db";
import { categories } from "@/db/schema/categories";
import { eq } from "drizzle-orm";
import type { InferInsertModel } from "drizzle-orm";

type CreateCategoryInput = InferInsertModel<typeof categories>;
type UpdateCategoryInput = Partial<CreateCategoryInput>;

export class CategoryRepository {
  // CREATE
  async create(data: CreateCategoryInput) {
    const [category] = await db
      .insert(categories)
      .values(data)
      .returning();

    return category;
  }

  // READ ALL
  async findAll() {
    return db.select().from(categories);
  }

  // READ BY ID
  async findById(id: number) {
    const [category] = await db
      .select()
      .from(categories)
      .where(eq(categories.id, id))
      .limit(1);

    return category ?? null;
  }

  // UPDATE
  async update(id: number, data: UpdateCategoryInput) {
    const [category] = await db
      .update(categories)
      .set(data)
      .where(eq(categories.id, id))
      .returning();

    return category ?? null;
  }

  // DELETE
  async delete(id: number) {
    const [category] = await db
      .delete(categories)
      .where(eq(categories.id, id))
      .returning();

    return category ?? null;
  }
}

export const categoryRepository = new CategoryRepository();