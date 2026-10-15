"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { Suspense, useEffect, useState, type FormEvent } from "react";

type Product = { id: number; categoryId: number; name: string; description: string | null; sku: string; price: string; createdAt: string; updatedAt: string };
type Category = { id: number; name: string };

function ProductDetails() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const [product, setProduct] = useState<Product | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  useEffect(() => {
    Promise.all([
      fetch(`/api/product/${params.id}`).then(async (r) => { const b = await r.json(); if (!r.ok) throw new Error(b.message); return b.data as Product; }),
      fetch("/api/category").then(async (r) => { const b = await r.json(); if (!r.ok) throw new Error(b.message); return b.data as Category[]; }),
    ]).then(([p, c]) => { setProduct(p); setCategories(c); }).catch((e: unknown) => setError(e instanceof Error ? e.message : "Could not load product.")).finally(() => setLoading(false));
  }, [params.id]);

  async function save(e: FormEvent<HTMLFormElement>) {
    e.preventDefault(); if (!product) return; setSaving(true); setError("");
    const form = new FormData(e.currentTarget);
    const payload = { name: String(form.get("name") ?? "").trim(), sku: String(form.get("sku") ?? "").trim(), description: String(form.get("description") ?? "").trim(), categoryId: Number(form.get("categoryId")), price: String(form.get("price") ?? "") };
    try { const r = await fetch(`/api/product/${product.id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) }); const b = await r.json(); if (!r.ok) throw new Error(b.message); setProduct(b.data); setEditing(false); setNotice("Product changes saved."); }
    catch (err) { setError(err instanceof Error ? err.message : "Could not save product."); } finally { setSaving(false); }
  }

  async function remove() {
    if (!product || !window.confirm(`Delete ${product.name}? This cannot be undone.`)) return;
    try { const r = await fetch(`/api/product/${product.id}`, { method: "DELETE" }); const b = await r.json(); if (!r.ok) throw new Error(b.message); router.push("/admin/products"); }
    catch (err) { setError(err instanceof Error ? err.message : "Could not delete product."); }
  }

  if (loading) return <div className="table-state">Loading product…</div>;
  if (!product) return <><div className="inline-error" role="alert">{error || "Product not found."}</div><Link className="secondary-button" href="/admin/products">Back to products</Link></>;
  return <>
    <div className="page-heading"><div><div className="eyebrow">PRODUCT DETAILS · #{product.id}</div><h1>{product.name}</h1><p>Review catalog details or update this product.</p></div><div className="heading-actions"><Link className="secondary-button" href="/admin/products">Back to products</Link><button className="primary-button" onClick={() => setEditing((v) => !v)}>{editing ? "Cancel" : "Edit product"}</button></div></div>
    {notice && <div className="inline-success" role="status">{notice}</div>}{error && <div className="inline-error" role="alert">{error}</div>}
    {editing ? <section className="management-panel detail-panel"><form className="admin-form" onSubmit={save}><label>Product name<input name="name" required maxLength={180} defaultValue={product.name} /></label><label>SKU<input name="sku" required maxLength={100} defaultValue={product.sku} /></label><label>Category<select name="categoryId" required defaultValue={String(product.categoryId)}>{categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}</select></label><label>Price<input name="price" type="number" min="0" step="0.01" required defaultValue={product.price} /></label><label className="span-two">Description<textarea name="description" rows={4} maxLength={2000} defaultValue={product.description ?? ""} /></label><div className="dialog-actions span-two"><button type="button" className="danger-button" onClick={() => void remove()}>Delete product</button><button className="primary-button" disabled={saving}>{saving ? "Saving…" : "Save changes"}</button></div></form></section> : <section className="management-panel product-detail"><div className="detail-title"><span className="product-symbol">{product.name.slice(0, 1).toUpperCase()}</span><div><h2>{product.name}</h2><span className="mono">{product.sku}</span></div><strong className="detail-price">${Number(product.price).toFixed(2)}</strong></div><div className="detail-grid"><div><span>CATEGORY</span><strong>{categories.find((c) => c.id === product.categoryId)?.name ?? "—"}</strong></div><div><span>CREATED</span><strong>{new Date(product.createdAt).toLocaleDateString()}</strong></div><div><span>LAST UPDATED</span><strong>{new Date(product.updatedAt).toLocaleDateString()}</strong></div><div className="span-two"><span>DESCRIPTION</span><p>{product.description || "No description provided."}</p></div></div></section>}
  </>;
}

export default function ProductDetailPage() {
  return <Suspense fallback={<div className="table-state">Loading product…</div>}><ProductDetails /></Suspense>;
}
