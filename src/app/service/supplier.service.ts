import {
  getAllSuppliers,
  getSupplierById,
  createSupplier,
  updateSupplier,
  deleteSupplier,
} from "@/app/repository/supplier.repository";

export async function listSuppliers() {
  return getAllSuppliers();
}

export async function findSupplier(id: number) {
  if (!Number.isInteger(id) || id <= 0) {
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
  if (!data.name?.trim()) {
    throw new Error("Supplier name is required");
  }

  return createSupplier({
    ...data,
    name: data.name.trim(),
  });
}

export async function editSupplier(
  id: number,
  data: {
    name?: string;
    email?: string | null;
    phone?: string | null;
    address?: string | null;
  },
) {
  if (!Number.isInteger(id) || id <= 0) {
    throw new Error("Invalid supplier ID");
  }

  if (data.name !== undefined && !data.name.trim()) {
    throw new Error("Supplier name cannot be empty");
  }

  const supplier = await updateSupplier(id, {
    ...data,
    ...(data.name !== undefined
      ? { name: data.name.trim() }
      : {}),
  });

  if (!supplier) {
    throw new Error("Supplier not found");
  }

  return supplier;
}

export async function removeSupplier(id: number) {
  if (!Number.isInteger(id) || id <= 0) {
    throw new Error("Invalid supplier ID");
  }

  const supplier = await deleteSupplier(id);

  if (!supplier) {
    throw new Error("Supplier not found");
  }

  return supplier;
}