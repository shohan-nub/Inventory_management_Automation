import { db } from "@/db";
import { customers } from "@/db/schema";
import { eq, desc, sql, ne } from "drizzle-orm";

export async function getAllCustomers() {
  return db.select().from(customers).orderBy(desc(customers.createdAt));
}

export async function getCustomerById(id: number) {
  const [customer] = await db
    .select()
    .from(customers)
    .where(eq(customers.id, id))
    .limit(1);

  return customer ?? null;
}

export async function getCustomerByName(name: string) {
  const [customer] = await db
    .select()
    .from(customers)
    .where(sql`lower(trim(${customers.name})) = ${name.trim().toLowerCase()}`)
    .limit(1);

  return customer ?? null;
}

export async function getCustomerByEmail(email: string) {
  const [customer] = await db
    .select()
    .from(customers)
    .where(sql`lower(trim(${customers.email})) = ${email.trim().toLowerCase()}`)
    .limit(1);

  return customer ?? null;
}

export async function createCustomer(data: {
  name: string;
  email?: string | null;
  phone?: string | null;
  address?: string | null;
}) {
  return db.transaction(async (tx) => {
    const [existingName] = await tx
      .select({ id: customers.id })
      .from(customers)
      .where(sql`lower(trim(${customers.name})) = ${data.name.trim().toLowerCase()}`)
      .limit(1);

    if (existingName) throw new Error("Customer name already exists");

    if (data.email) {
      const [existingEmail] = await tx
        .select({ id: customers.id })
        .from(customers)
        .where(sql`lower(trim(${customers.email})) = ${data.email.trim().toLowerCase()}`)
        .limit(1);

      if (existingEmail) throw new Error("Customer email already exists");
    }

    const [customer] = await tx
      .insert(customers)
      .values(data)
      .returning();

    return customer;
  });
}

export async function updateCustomer(
  id: number,
  data: {
    name?: string;
    email?: string | null;
    phone?: string | null;
    address?: string | null;
  }
) {
  return db.transaction(async (tx) => {
    if (data.name) {
      const [existing] = await tx.select({ id: customers.id })
        .from(customers)
        .where(sql`lower(trim(${customers.name})) = ${data.name.trim().toLowerCase()}`)
        .limit(1);

      if (existing && existing.id !== id) {
        throw new Error("Customer name already exists");
      }
    }

    if (data.email) {
      const [existing] = await tx.select({ id: customers.id })
        .from(customers)
        .where(sql`lower(trim(${customers.email})) = ${data.email.trim().toLowerCase()}`)
        .limit(1);

      if (existing && existing.id !== id) {
        throw new Error("Customer email already exists");
      }
    }

    const [customer] = await tx
      .update(customers)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(customers.id, id))
      .returning();

    return customer ?? null;
  });
}

export async function deleteCustomer(id: number) {
  const [customer] = await db
    .delete(customers)
    .where(eq(customers.id, id))
    .returning();

  return customer ?? null;
}