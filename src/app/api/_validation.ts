export class InputError extends Error {}

export function objectBody(value: unknown): Record<string, unknown> {
  if (!value || typeof value !== "object" || Array.isArray(value)) throw new InputError("Request body must be a JSON object.");
  return value as Record<string, unknown>;
}

export function requiredText(value: unknown, field: string, max: number): string {
  if (typeof value !== "string" || !value.trim() || value.trim().length > max) throw new InputError(`${field} is required and must be at most ${max} characters.`);
  return value.trim();
}

export function optionalText(value: unknown, field: string, max: number): string | null {
  if (value == null || value === "") return null;
  if (typeof value !== "string" || value.length > max) throw new InputError(`${field} must be at most ${max} characters.`);
  return value.trim() || null;
}

export function optionalEmail(value: unknown): string | null {
  const email = optionalText(value, "Email", 254);
  if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) throw new InputError("Email must be a valid email address.");
  return email;
}

export function positiveId(value: unknown, field: string): number {
  const id = typeof value === "number" ? value : Number(value);
  if (!Number.isInteger(id) || id <= 0 || id > 2147483647) throw new InputError(`${field} must be a valid positive whole number.`);
  return id;
}

export function nonnegativeInt(value: unknown, field: string): number {
  const number = typeof value === "number" ? value : Number(value);
  if (!Number.isInteger(number) || number < 0 || number > 2147483647) throw new InputError(`${field} must be a valid non-negative whole number.`);
  return number;
}

export function validPrice(value: unknown): string {
  const price = typeof value === "string" || typeof value === "number" ? String(value) : "";
  if (!/^\d{1,8}(\.\d{1,2})?$/.test(price)) throw new InputError("Price must be a non-negative amount with up to two decimal places.");
  return price;
}

export function errorResponse(error: unknown, fallback: string, constraintMessages: Record<string, string> = {}) {
  if (error instanceof InputError) return Response.json({ success: false, message: error.message }, { status: 400 });
  const code = typeof error === "object" && error !== null && "code" in error ? String(error.code) : "";
  if (constraintMessages[code]) return Response.json({ success: false, message: constraintMessages[code] }, { status: 409 });
  console.error(fallback, error);
  return Response.json({ success: false, message: fallback }, { status: 500 });
}

export function publicErrorMessage(error: unknown, fallback: string): string {
  if (typeof error === "object" && error !== null && "code" in error) return fallback;
  return error instanceof Error ? error.message : fallback;
}
