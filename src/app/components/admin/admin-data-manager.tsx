"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState, type FormEvent } from "react";

type Category = { id: number; name: string; description: string | null; createdAt: string };
type Product = { id: number; categoryId: number; name: string; description: string | null; sku: string; price: string; createdAt: string; updatedAt: string };
type Inventory = { id: number; productId: number; quantity: number; reorderLevel: number; updatedAt: string };
type Resource = "products" | "categories" | "inventory";
type Props = { resource: Resource };

const endpoint: Record<Resource, string> = { products: "/api/product", categories: "/api/category", inventory: "/api/inventory" };

async function request<T>(url: string, init?: RequestInit): Promise<T> {
  const response = await fetch(url, { ...init, headers: { "Content-Type": "application/json", ...init?.headers } });
  const body = await response.json().catch(() => ({})) as { success?: boolean; data?: T; message?: string };
  if (!response.ok || body.success === false) throw new Error(body.message || "The request could not be completed.");
  return body.data as T;
}

export function AdminDataManager({ resource }: Props) {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [inventory, setInventory] = useState<Inventory[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [query, setQuery] = useState("");
  const [editing, setEditing] = useState<Product | Category | Inventory | null>(null);
  const [creating, setCreating] = useState(false);
  const [saving, setSaving] = useState(false);
  const [notice, setNotice] = useState("");

  const load = useCallback(async () => {
    setLoading(true); setError("");
    try {
      const [p, c, i] = await Promise.all([
        request<Product[]>(endpoint.products), request<Category[]>(endpoint.categories), request<Inventory[]>(endpoint.inventory),
      ]);
      setProducts(p); setCategories(c); setInventory(i);
    } catch (e) { setError(e instanceof Error ? e.message : "Could not load records."); }
    finally { setLoading(false); }
  }, []);
  useEffect(() => { const timer = window.setTimeout(() => { void load(); }, 0); return () => window.clearTimeout(timer); }, [load]);

  const title = resource[0].toUpperCase() + resource.slice(1);
  const filteredProducts = useMemo(() => products.filter((x) => `${x.name} ${x.sku}`.toLowerCase().includes(query.toLowerCase())), [products, query]);
  const filteredCategories = useMemo(() => categories.filter((x) => `${x.name} ${x.description ?? ""}`.toLowerCase().includes(query.toLowerCase())), [categories, query]);
  const filteredInventory = useMemo(() => inventory.filter((x) => (products.find((p) => p.id === x.productId)?.name ?? "").toLowerCase().includes(query.toLowerCase())), [inventory, products, query]);

  async function remove(id: number) {
    const row = resource === "products" ? products.find((x) => x.id === id)?.name : resource === "categories" ? categories.find((x) => x.id === id)?.name : "this inventory record";
    if (!window.confirm(`Delete ${row ?? "this record"}? This action cannot be undone.`)) return;
    setNotice("");
    try { await request(`${endpoint[resource]}/${id}`, { method: "DELETE" }); setNotice(`${title.slice(0, -1)} deleted.`); await load(); }
    catch (e) { setError(e instanceof Error ? e.message : "Delete failed."); }
  }

  async function save(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); setSaving(true); setError(""); setNotice("");
    const form = new FormData(event.currentTarget);
    let payload: Record<string, string | number>;
    if (resource === "products") payload = { name: String(form.get("name") ?? "").trim(), sku: String(form.get("sku") ?? "").trim(), description: String(form.get("description") ?? "").trim(), categoryId: Number(form.get("categoryId")), price: String(form.get("price") ?? "") };
    else if (resource === "categories") payload = { name: String(form.get("name") ?? "").trim(), description: String(form.get("description") ?? "").trim() };
    else payload = { ...(editing ? {} : { productId: Number(form.get("productId")) }), quantity: Number(form.get("quantity")), reorderLevel: Number(form.get("reorderLevel")) };
    const id = editing?.id;
    try {
      await request(id ? `${endpoint[resource]}/${id}` : endpoint[resource], { method: id ? "PATCH" : "POST", body: JSON.stringify(payload) });
      setCreating(false); setEditing(null); setNotice(`${title.slice(0, -1)} ${id ? "updated" : "created"}.`); await load();
    } catch (e) { setError(e instanceof Error ? e.message : "Could not save this record."); }
    finally { setSaving(false); }
  }

  const formRecord = editing as Record<string, unknown> | null;
  return <>
    <div className="page-heading"><div><div className="eyebrow">CATALOG MANAGEMENT</div><h1>{title}</h1><p>Manage your {resource} and keep your workspace up to date.</p></div><button className="primary-button" onClick={() => { setEditing(null); setCreating(true); setError(""); }}>＋ Add {resource === "inventory" ? "record" : resource.slice(0, -1)}</button></div>
    <section className="management-panel">
      <div className="management-toolbar"><div><strong>{loading ? "Loading…" : `${resource === "products" ? products.length : resource === "categories" ? categories.length : inventory.length} records`}</strong><span> Current workspace</span></div><label className="table-search"><span>⌕</span><input value={query} onChange={(e) => setQuery(e.target.value)} placeholder={resource === "products" ? "Search name or SKU" : resource === "categories" ? "Search categories" : "Search product"} /></label></div>
      {notice && <div className="inline-success" role="status">{notice}</div>}{error && <div className="inline-error" role="alert">{error}<button onClick={() => setError("")}>Dismiss</button></div>}
      {loading ? <div className="table-state">Loading {resource}…</div> : resource === "products" ? filteredProducts.length ? <div className="data-table-wrap"><table className="data-table"><thead><tr><th>PRODUCT</th><th>SKU</th><th>CATEGORY</th><th>PRICE</th><th>ADDED</th><th /></tr></thead><tbody>{filteredProducts.map((p) => <tr key={p.id}><td><Link className="row-title" href={`/admin/products/${p.id}`}>{p.name}</Link><small>{p.description || "No description"}</small></td><td className="mono">{p.sku}</td><td>{categories.find((c) => c.id === p.categoryId)?.name ?? "—"}</td><td>${Number(p.price).toFixed(2)}</td><td>{new Date(p.createdAt).toLocaleDateString()}</td><td className="row-actions"><Link href={`/admin/products/${p.id}`}>Edit</Link><button onClick={() => void remove(p.id)}>Delete</button></td></tr>)}</tbody></table></div> : <div className="table-state">{query ? "No products match your search." : "No products yet. Add your first product to get started."}</div>
      : resource === "categories" ? filteredCategories.length ? <div className="data-table-wrap"><table className="data-table"><thead><tr><th>CATEGORY</th><th>DESCRIPTION</th><th>PRODUCTS</th><th>CREATED</th><th /></tr></thead><tbody>{filteredCategories.map((c) => <tr key={c.id}><td><strong className="row-title">{c.name}</strong></td><td>{c.description || "—"}</td><td>{products.filter((p) => p.categoryId === c.id).length}</td><td>{new Date(c.createdAt).toLocaleDateString()}</td><td className="row-actions"><button onClick={() => { setEditing(c); setCreating(true); }}>Edit</button><button onClick={() => void remove(c.id)}>Delete</button></td></tr>)}</tbody></table></div> : <div className="table-state">{query ? "No categories match your search." : "No categories yet. Add a category before creating products."}</div>
      : filteredInventory.length ? <div className="data-table-wrap"><table className="data-table"><thead><tr><th>PRODUCT</th><th>SKU</th><th>ON HAND</th><th>REORDER AT</th><th>STATUS</th><th>UPDATED</th><th /></tr></thead><tbody>{filteredInventory.map((item) => { const product = products.find((p) => p.id === item.productId); const low = item.quantity <= item.reorderLevel; return <tr key={item.id}><td><strong className="row-title">{product?.name ?? `Product #${item.productId}`}</strong></td><td className="mono">{product?.sku ?? "—"}</td><td>{item.quantity}</td><td>{item.reorderLevel}</td><td><span className={`stock-pill ${low ? "stock-low" : "stock-ok"}`}>{low ? "Low stock" : "In stock"}</span></td><td>{new Date(item.updatedAt).toLocaleDateString()}</td><td className="row-actions"><button onClick={() => { setEditing(item); setCreating(true); }}>Edit</button><button onClick={() => void remove(item.id)}>Delete</button></td></tr>; })}</tbody></table></div> : <div className="table-state">{query ? "No inventory records match your search." : "No inventory records yet. Add stock for a product to get started."}</div>}
    </section>
    {creating && <div className="dialog-backdrop" role="presentation" onMouseDown={(e) => { if (e.target === e.currentTarget) { setCreating(false); setEditing(null); } }}><section className="form-dialog" role="dialog" aria-modal="true" aria-labelledby="form-title"><div className="dialog-heading"><div><div className="eyebrow">{editing ? "UPDATE RECORD" : "NEW RECORD"}</div><h2 id="form-title">{editing ? "Edit" : "Add"} {resource === "inventory" ? "inventory" : resource.slice(0, -1)}</h2></div><button className="icon-button" onClick={() => { setCreating(false); setEditing(null); }} aria-label="Close">×</button></div>
      <form onSubmit={save} className="admin-form">
        {resource === "products" && <><label>Product name<input name="name" required maxLength={180} defaultValue={String(formRecord?.name ?? "")} /></label><label>SKU<input name="sku" required maxLength={100} defaultValue={String(formRecord?.sku ?? "")} /></label><label>Category<select name="categoryId" required defaultValue={String(formRecord?.categoryId ?? "")}><option value="" disabled>Select a category</option>{categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}</select></label><label>Price<input name="price" type="number" min="0" step="0.01" required defaultValue={String(formRecord?.price ?? "")} /></label><label className="span-two">Description<textarea name="description" rows={3} maxLength={2000} defaultValue={String(formRecord?.description ?? "")} /></label></>}
        {resource === "categories" && <><label>Category name<input name="name" required maxLength={180} defaultValue={String(formRecord?.name ?? "")} /></label><label className="span-two">Description<textarea name="description" rows={4} maxLength={2000} defaultValue={String(formRecord?.description ?? "")} /></label></>}
        {resource === "inventory" && <><label className="span-two">Product<select name="productId" required disabled={Boolean(editing)} defaultValue={String(formRecord?.productId ?? "")}><option value="" disabled>Select a product</option>{products.filter((p) => !inventory.some((i) => i.productId === p.id) || p.id === formRecord?.productId).map((p) => <option key={p.id} value={p.id}>{p.name} · {p.sku}</option>)}</select>{editing && <small>Product association cannot be changed.</small>}</label><label>Quantity<input name="quantity" type="number" min="0" step="1" required defaultValue={String(formRecord?.quantity ?? 0)} /></label><label>Reorder level<input name="reorderLevel" type="number" min="0" step="1" required defaultValue={String(formRecord?.reorderLevel ?? 5)} /></label></>}
        {error && <div className="inline-error span-two" role="alert">{error}</div>}<div className="dialog-actions span-two"><button type="button" className="secondary-button" onClick={() => { setCreating(false); setEditing(null); }}>Cancel</button><button className="primary-button" disabled={saving}>{saving ? "Saving…" : editing ? "Save changes" : "Create"}</button></div>
      </form></section></div>}
  </>;
}
