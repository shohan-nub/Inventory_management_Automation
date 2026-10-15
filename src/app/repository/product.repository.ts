import { db } from "@/db";
import { products } from "@/db/schema/products";
import { inventory } from "@/db/schema/inventory";
import { eq } from "drizzle-orm";
import type { InferInsertModel } from "drizzle-orm";

type CreateProductInput = InferInsertModel<typeof products>;
type UpdateProductInput = Partial<CreateProductInput>;

export class ProductRepository {
  // CREATE
  async create(data: CreateProductInput) {
    return db.transaction(async (tx) => {
      const [product] = await tx.insert(products).values(data).returning();
      await tx.insert(inventory).values({ productId: product.id, quantity: 0 });
      return product;
    });
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
    return db.transaction(async (tx) => {
      await tx.delete(inventory).where(eq(inventory.productId, id));
      const [product] = await tx.delete(products).where(eq(products.id, id)).returning();
      return product ?? null;
    });
  }
}

export const productRepository = new ProductRepository();
