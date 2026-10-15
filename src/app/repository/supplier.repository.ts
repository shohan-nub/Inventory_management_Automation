import { db } from "@/db";
import { suppliers } from "@/db/schema";
import { eq, desc } from "drizzle-orm";

export async function getAllSuppliers() {
  return db
    .select()
    .from(suppliers)
    .orderBy(desc(suppliers.createdAt));
}

export async function getSupplierById(id: number) {
  const [supplier] = await db
    .select()
    .from(suppliers)
    .where(eq(suppliers.id, id))
    .limit(1);

  return supplier ?? null;
}

export async function createSupplier(data: {
  name: string;
  email?: string | null;
  phone?: string | null;
  address?: string | null;
}) {
  const [supplier] = await db
    .insert(suppliers)
    .values(data)
    .returning();

  return supplier;
}

export async function updateSupplier(
  id: number,
  data: {
    name?: string;
    email?: string | null;
    phone?: string | null;
    address?: string | null;
  },
) {
  const [supplier] = await db
    .update(suppliers)
    .set({
      ...data,
      updatedAt: new Date(),
    })
    .where(eq(suppliers.id, id))
    .returning();

  return supplier ?? null;
}

export async function deleteSupplier(id: number) {
  const [supplier] = await db
    .delete(suppliers)
    .where(eq(suppliers.id, id))
    .returning();

  return supplier ?? null;
}