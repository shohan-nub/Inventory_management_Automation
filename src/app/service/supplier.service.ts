import {
  getAllSuppliers,
  getSupplierById,
  getSupplierByName,
  getSupplierByEmail,
  createSupplier,
  updateSupplier,
  deleteSupplier,
} from "@/app/repository/supplier.repository";

function normalizeName(name: string) {
  return name.trim().toLowerCase();
}

function normalizeEmail(email?: string | null) {
  return email?.trim().toLowerCase() || null;
}

async function validateDuplicateSupplier(
  name: string,
  email: string | null,
  excludeId?: number
) {
  const existingName = await getSupplierByName(name);

  if (existingName && existingName.id !== excludeId) {
    throw new Error(
      "A supplier with this name already exists"
    );
  }

  if (email) {
    const existingEmail = await getSupplierByEmail(email);

    if (existingEmail && existingEmail.id !== excludeId) {
      throw new Error(
        "A supplier with this email already exists"
      );
    }
  }
}

export async function listSuppliers() {
  return getAllSuppliers();
}

export async function findSupplier(id: number) {
  if (!Number.isSafeInteger(id) || id <= 0) {
    throw new Error("Invalid supplier ID");
  }

  const supplier = await getSupplierById(id);

  if (!supplier) {
    throw new Error("Supplier not found");
  }

  return supplier;
}

export async function addSupplier(data: {
  name: string;
  email?: string | null;
  phone?: string | null;
  address?: string | null;
}) {
  if (typeof data.name !== "string" || !data.name.trim()) {
    throw new Error("Supplier name is required");
  }

  const name = data.name.trim();
  const email = normalizeEmail(data.email);

  await validateDuplicateSupplier(name, email);

  return createSupplier({
    ...data,
    name,
    email,
  });
}

export async function editSupplier(
  id: number,
  data: {
    name?: string;
    email?: string | null;
    phone?: string | null;
    address?: string | null;
  }
) {
  if (!Number.isSafeInteger(id) || id <= 0) {
    throw new Error("Invalid supplier ID");
  }

  if (
    data.name !== undefined &&
    (typeof data.name !== "string" || !data.name.trim())
  ) {
    throw new Error("Supplier name cannot be empty");
  }

  const currentSupplier = await findSupplier(id);

  const name =
    data.name !== undefined
      ? data.name.trim()
      : currentSupplier.name;

  const email =
    data.email !== undefined
      ? normalizeEmail(data.email)
      : currentSupplier.email;

  await validateDuplicateSupplier(name, email, id);

  const supplier = await updateSupplier(id, {
    ...data,
    name,
    email,
  });

  if (!supplier) {
    throw new Error("Supplier not found");
  }

  return supplier;
}

export async function removeSupplier(id: number) {
  if (!Number.isSafeInteger(id) || id <= 0) {
    throw new Error("Invalid supplier ID");
  }

  const supplier = await deleteSupplier(id);

  if (!supplier) {
    throw new Error("Supplier not found");
  }

  return supplier;
}