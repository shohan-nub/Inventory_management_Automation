"use client";

import { useCallback, useEffect, useState, type FormEvent } from "react";

type Customer = {
  id: number;
  name: string;
  email: string | null;
  phone: string | null;
  address: string | null;
  createdAt: string;
};

type ApiResult<T> = { success?: boolean; data?: T; message?: string };

async function request<T>(url: string, init?: RequestInit): Promise<T> {
  const response = await fetch(url, {
    ...init,
    headers: { "Content-Type": "application/json", ...init?.headers },
  });
  const body = await response.json().catch(() => ({})) as ApiResult<T>;

  if (!response.ok || body.success === false) {
    throw new Error(body.message || "The request could not be completed.");
  }

  return body.data as T;
}

export default function CustomersPage() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [query, setQuery] = useState("");
  const [creating, setCreating] = useState(false);
  const [editing, setEditing] = useState<Customer | null>(null);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  const loadCustomers = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      setCustomers(await request<Customer[]>("/api/customer"));
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not load customers.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const timer = window.setTimeout(() => void loadCustomers(), 0);
    return () => window.clearTimeout(timer);
  }, [loadCustomers]);

  const filtered = customers.filter((customer) =>
    `${customer.name} ${customer.email ?? ""} ${customer.phone ?? ""} ${customer.address ?? ""}`
      .toLowerCase().includes(query.toLowerCase()),
  );

  function closeForm() {
    if (saving) return;
    setCreating(false);
    setEditing(null);
    setError("");
  }

  async function saveCustomer(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (saving) return;
    const form = new FormData(event.currentTarget);
    const payload = {
      name: String(form.get("name") ?? "").trim(),
      email: String(form.get("email") ?? "").trim(),
      phone: String(form.get("phone") ?? "").trim(),
      address: String(form.get("address") ?? "").trim(),
    };
    setSaving(true);
    setError("");
    setNotice("");
    try {
      await request<Customer>(editing ? `/api/customer/${editing.id}` : "/api/customer", {
        method: editing ? "PATCH" : "POST",
        body: JSON.stringify(payload),
      });
      setNotice(`Customer ${editing ? "updated" : "created"} successfully.`);
      setCreating(false);
      setEditing(null);
      await loadCustomers();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not save customer.");
    } finally {
      setSaving(false);
    }
  }

  async function deleteCustomer(customer: Customer) {
    if (deletingId !== null || !window.confirm(`Delete ${customer.name}? This action cannot be undone.`)) return;
    setDeletingId(customer.id);
    setError("");
    setNotice("");
    try {
      await request(`/api/customer/${customer.id}`, { method: "DELETE" });
      setNotice("Customer deleted successfully.");
      await loadCustomers();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not delete customer.");
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <div className="sales-customers-page">
      <div className="page-heading">
        <div><div className="eyebrow">SALES MANAGEMENT</div><h1>Customers</h1><p>Manage the customers associated with your sales orders.</p></div>
        <button className="primary-button" onClick={() => { setEditing(null); setCreating(true); setError(""); }}>＋ Add customer</button>
      </div>
      {notice && <div className="inline-success" role="status">{notice}</div>}
      {error && !creating && <div className="inline-error" role="alert">{error}<button onClick={() => setError("")}>Dismiss</button></div>}
      <section className="management-panel">
        <div className="management-toolbar">
          <div><strong>{loading ? "Loading…" : `${customers.length} customers`}</strong><span> Sales contacts</span></div>
          <label className="table-search"><span aria-hidden="true">⌕</span><input aria-label="Search customers" placeholder="Search name, email or phone" value={query} onChange={(event) => setQuery(event.target.value)} /></label>
        </div>
        {loading ? <div className="table-state">Loading customers…</div> : filtered.length ? (
          <div className="data-table-wrap">
            <table className="data-table">
              <thead><tr><th>CUSTOMER</th><th>EMAIL</th><th>PHONE</th><th>ADDRESS</th><th>ADDED</th><th /></tr></thead>
              <tbody>{filtered.map((customer) => (
                <tr key={customer.id}>
                  <td><strong className="row-title">{customer.name}</strong></td>
                  <td>{customer.email || "—"}</td>
                  <td>{customer.phone || "—"}</td>
                  <td className="address-cell">{customer.address || "—"}</td>
                  <td>{new Date(customer.createdAt).toLocaleDateString()}</td>
                  <td className="row-actions">
                    <button disabled={deletingId !== null} onClick={() => { setEditing(customer); setCreating(true); setError(""); }}>Edit</button>
                    <button disabled={deletingId !== null} onClick={() => void deleteCustomer(customer)}>{deletingId === customer.id ? "Deleting…" : "Delete"}</button>
                  </td>
                </tr>
              ))}</tbody>
            </table>
          </div>
        ) : <div className="table-state">{query ? "No customers match your search." : "No customers yet. Add your first customer to create a sale."}</div>}
      </section>

      {creating && (
        <div className="dialog-backdrop" onMouseDown={(event) => { if (event.target === event.currentTarget) closeForm(); }}>
          <section className="form-dialog" role="dialog" aria-modal="true" aria-labelledby="customer-form-title">
            <div className="dialog-heading">
              <div><div className="eyebrow">CUSTOMER RECORD</div><h2 id="customer-form-title">{editing ? "Edit customer" : "Add customer"}</h2></div>
              <button type="button" className="icon-button" onClick={closeForm} aria-label="Close dialog" disabled={saving}>×</button>
            </div>
            <form className="admin-form" onSubmit={saveCustomer}>
              <label className="span-two">Customer name<input name="name" required maxLength={180} defaultValue={editing?.name ?? ""} /></label>
              <label>Email<input name="email" type="email" maxLength={254} defaultValue={editing?.email ?? ""} /></label>
              <label>Phone<input name="phone" maxLength={80} defaultValue={editing?.phone ?? ""} /></label>
              <label className="span-two">Address<textarea name="address" rows={3} maxLength={1000} defaultValue={editing?.address ?? ""} /></label>
              {error && <div className="inline-error span-two" role="alert">{error}</div>}
              <div className="dialog-actions span-two">
                <button type="button" className="secondary-button" onClick={closeForm} disabled={saving}>Cancel</button>
                <button className="primary-button" disabled={saving}>{saving ? "Saving…" : "Save customer"}</button>
              </div>
            </form>
          </section>
        </div>
      )}
    </div>
  );
}
