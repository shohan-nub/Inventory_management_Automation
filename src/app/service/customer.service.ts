import {
  getAllCustomers,
  getCustomerById,
  getCustomerByName,
  getCustomerByEmail,
  createCustomer,
  updateCustomer,
  deleteCustomer,
} from "@/app/repository/customer.repository";

export async function listCustomers() {
  return getAllCustomers();
}

export async function findCustomer(id: number) {
  if (!Number.isSafeInteger(id) || id <= 0) {
    throw new Error("Invalid customer ID");
  }

  const customer = await getCustomerById(id);

  if (!customer) throw new Error("Customer not found");

  return customer;
}

export async function addCustomer(data: {
  name: string;
  email?: string | null;
  phone?: string | null;
  address?: string | null;
}) {
  if (!data.name?.trim()) {
    throw new Error("Customer name is required");
  }

  const name = data.name.trim();
  const email = data.email?.trim().toLowerCase() || null;

  const existingName = await getCustomerByName(name);

  if (existingName) {
    throw new Error("Customer name already exists");
  }

  if (email) {
    const existingEmail = await getCustomerByEmail(email);

    if (existingEmail) {
      throw new Error("Customer email already exists");
    }
  }

  return createCustomer({
    ...data,
    name,
    email,
  });
}

export async function editCustomer(
  id: number,
  data: {
    name?: string;
    email?: string | null;
    phone?: string | null;
    address?: string | null;
  }
) {
  const current = await findCustomer(id);

  const name = data.name?.trim() || current.name;
  const email =
    data.email !== undefined
      ? data.email?.trim().toLowerCase() || null
      : current.email;

  const existingName = await getCustomerByName(name);

  if (existingName && existingName.id !== id) {
    throw new Error("Customer name already exists");
  }

  if (email) {
    const existingEmail = await getCustomerByEmail(email);

    if (existingEmail && existingEmail.id !== id) {
      throw new Error("Customer email already exists");
    }
  }

  const customer = await updateCustomer(id, {
    ...data,
    name,
    email,
  });

  if (!customer) throw new Error("Customer not found");

  return customer;
}

export async function removeCustomer(id: number) {
  if (!Number.isSafeInteger(id) || id <= 0) {
    throw new Error("Invalid customer ID");
  }

  const customer = await deleteCustomer(id);

  if (!customer) throw new Error("Customer not found");

  return customer;
}