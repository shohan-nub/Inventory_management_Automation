import { db } from "@/db";
import { products } from "@/db/schema/products";
import { eq } from "drizzle-orm";
import type { InferInsertModel } from "drizzle-orm";

type CreateProductInput = InferInsertModel<typeof products>;
type UpdateProductInput = Partial<CreateProductInput>;

export class ProductRepository {
  // CREATE
  async create(data: CreateProductInput) {
    const [product] = await db
      .insert(products)
      .values(data)
      .returning();

    return product;
  }

  // READ ALL
  async findAll() {
    return db.select().from(products);
  }

  // READ BY ID
  async findById(id: number) {
    const [product] = await db
      .select()
      .from(products)
      .where(eq(products.id, id))
      .limit(1);

    return product ?? null;
  }

  // UPDATE
  async update(id: number, data: UpdateProductInput) {
    const [product] = await db
      .update(products)
      .set({
        ...data,
        updatedAt: new Date(),
      })
      .where(eq(products.id, id))
      .returning();

    return product ?? null;
  }

  // DELETE
  async delete(id: number) {
    const [product] = await db
      .delete(products)
      .where(eq(products.id, id))
      .returning();

    return product ?? null;
  }
}

export const productRepository = new ProductRepository();