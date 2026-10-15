"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { formatCurrency } from "@/lib/currency";

type Product = { id: number; name: string; sku: string; price: string; categoryId: number; createdAt: string };
type Category = { id: number; name: string };
type Inventory = { id: number; productId: number; quantity: number; reorderLevel: number };
type Supplier = { id: number; name: string };
type Purchase = { id: number; status: string; totalAmount: string; supplierName: string; createdAt: string };
async function get<T>(path: string): Promise<T> { const res = await fetch(path); const body = await res.json(); if (!res.ok || body.success === false) throw new Error(body.message ?? "Unable to load dashboard data."); return body.data as T; }

export default function AdminDashboard() {
  const [products, setProducts] = useState<Product[]>([]); const [categories, setCategories] = useState<Category[]>([]); const [inventory, setInventory] = useState<Inventory[]>([]); const [suppliers,setSuppliers]=useState<Supplier[]>([]);const [purchases,setPurchases]=useState<Purchase[]>([]); const [loading, setLoading] = useState(true); const [error, setError] = useState("");
  useEffect(() => { Promise.all([get<Product[]>("/api/product"), get<Category[]>("/api/category"), get<Inventory[]>("/api/inventory"), get<Supplier[]>("/api/supplier"),get<Purchase[]>("/api/purchase")]).then(([p,c,i,s,po]) => { setProducts(p); setCategories(c); setInventory(i);setSuppliers(s);setPurchases(po); }).catch((e: unknown) => setError(e instanceof Error ? e.message : "Could not load dashboard.")).finally(() => setLoading(false)); }, []);
  const low = inventory.filter((item) => item.quantity <= item.reorderLevel);
  const total = inventory.reduce((sum, item) => sum + item.quantity, 0);
  const latest = [...products].sort((a,b) => new Date(b.createdAt).getTime()-new Date(a.createdAt).getTime()).slice(0,5);
  return <>
    <div className="page-heading"><div><div className="eyebrow">OVERVIEW</div><h1>Good to see you</h1><p>Here’s what’s happening across your inventory today.</p></div><Link className="primary-button" href="/admin/products">Manage products <span>↗</span></Link></div>
    {error && <div className="inline-error" role="alert">{error}<button onClick={() => location.reload()}>Retry</button></div>}
    <div className="summary-grid">
      {[{ label:"Total products", value: products.length, note:"Across your catalog", icon:"▦" },{ label:"Categories", value:categories.length,note:"Product groupings",icon:"◈"},{ label:"Suppliers",value:suppliers.length,note:"Purchasing contacts",icon:"♧"},{ label:"Inventory units",value:total.toLocaleString(),note:"Units across tracked products",icon:"▤"},{ label:"Low-stock products",value:low.length,note:"At or below reorder level",icon:"⌁",warn:low.length>0},{ label:"Pending purchases",value:purchases.filter((p)=>p.status==="pending").length,note:"Awaiting receipt",icon:"◷"},{ label:"Received purchases",value:purchases.filter((p)=>p.status==="received").length,note:"Completed orders",icon:"✓"},{ label:"Purchase value",value:formatCurrency(purchases.reduce((sum,p)=>sum+Number(p.totalAmount),0)),note:"All order statuses",icon:"৳"}].map((stat) => <article className="summary-card" key={stat.label}><div className="summary-card-top"><span className="summary-icon">{stat.icon}</span><span className="eyebrow">LIVE</span></div><p>{stat.label}</p><strong className={stat.warn ? "warning-value" : ""}>{loading ? "—" : stat.value}</strong><small>{stat.note}</small></article>)}
    </div>
    <div className="dashboard-sections">
      <section className="management-panel dashboard-panel"><div className="section-heading"><div><div className="eyebrow">CATALOG</div><h2>Recently added products</h2></div><Link href="/admin/products">View all <span>→</span></Link></div>
        {loading ? <div className="table-state">Loading products…</div> : latest.length ? <div className="data-table-wrap"><table className="data-table"><thead><tr><th>PRODUCT</th><th>SKU</th><th>CATEGORY</th><th>PRICE (৳)</th></tr></thead><tbody>{latest.map((product) => <tr key={product.id}><td><Link className="row-title" href={`/admin/products/${product.id}`}>{product.name}</Link></td><td className="mono">{product.sku}</td><td>{categories.find(c=>c.id===product.categoryId)?.name ?? "—"}</td><td>{formatCurrency(product.price)}</td></tr>)}</tbody></table></div> : <div className="table-state">No products yet. <Link href="/admin/products">Add your first product</Link>.</div>}
      </section>
      <section className="management-panel dashboard-panel"><div className="section-heading"><div><div className="eyebrow">REPLENISHMENT</div><h2>Low stock overview</h2></div><Link href="/admin/inventory">Inventory <span>→</span></Link></div>
        {loading ? <div className="table-state">Loading inventory…</div> : low.length ? <ul className="low-stock-list">{low.slice(0,6).map((item) => { const product=products.find(p=>p.id===item.productId); return <li key={item.id}><span className="stock-indicator">!</span><span className="low-stock-name"><strong>{product?.name ?? `Product #${item.productId}`}</strong><small>{product?.sku ?? "Inventory item"}</small></span><span className="stock-count"><strong>{item.quantity}</strong><small>of {item.reorderLevel} min</small></span></li>; })}</ul> : <div className="table-state">{inventory.length ? "All tracked products are above their reorder levels." : "Add inventory records to track stock levels."}</div>}
      </section>
      <section className="management-panel dashboard-panel stock-summary"><div className="section-heading"><div><div className="eyebrow">STOCK HEALTH</div><h2>Inventory summary</h2></div><Link href="/admin/inventory">View inventory <span>→</span></Link></div>
        {loading ? <div className="table-state">Calculating stock…</div> : <><div className="stock-total"><strong>{total.toLocaleString()}</strong><span>units currently tracked</span></div><div className="stock-meter"><span style={{ width: `${inventory.length ? Math.max(4, ((inventory.length-low.length)/inventory.length)*100) : 0}%` }} /></div><div className="stock-legend"><span><i className="legend-green" />{inventory.length-low.length} healthy records</span><span><i className="legend-amber" />{low.length} need attention</span></div></>}
      </section>
    </div>
  </>;
}
