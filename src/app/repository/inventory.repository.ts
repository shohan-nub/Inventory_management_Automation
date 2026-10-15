import { db } from "@/db";
import { inventory } from "@/db/schema/inventory";
import { eq } from "drizzle-orm";
import type { InferInsertModel } from "drizzle-orm";

type CreateInventoryInput = InferInsertModel<typeof inventory>;
type UpdateInventoryInput = Partial<CreateInventoryInput>;

export class InventoryRepository {
  // CREATE
  async create(data: CreateInventoryInput) {
    const [item] = await db
      .insert(inventory)
      .values(data)
      .returning();

    return item;
  }

  // READ ALL
  async findAll() {
    return db.select().from(inventory);
  }

  // READ BY ID
  async findById(id: number) {
    const [item] = await db
      .select()
      .from(inventory)
      .where(eq(inventory.id, id))
      .limit(1);

    return item ?? null;
  }

  // UPDATE
  async update(id: number, data: UpdateInventoryInput) {
    const [item] = await db
      .update(inventory)
      .set({
        ...data,
        updatedAt: new Date(),
      })
      .where(eq(inventory.id, id))
      .returning();

    return item ?? null;
  }

  // DELETE
  async delete(id: number) {
    const [item] = await db
      .delete(inventory)
      .where(eq(inventory.id, id))
      .returning();

    return item ?? null;
  }
}

export const inventoryRepository = new InventoryRepository();