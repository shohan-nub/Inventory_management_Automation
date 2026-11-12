"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { Suspense, useCallback, useEffect, useState, type FormEvent } from "react";
import { formatCurrency } from "@/lib/currency";

type SalesOrder = {
  id: number;
  customerId: number;
  status: string;
  subtotal: string;
  discount: string;
  totalAmount: string;
  createdAt: string;
  updatedAt: string;
};

type Customer = { id: number; name: string; email: string | null; phone: string | null; address: string | null };
type Product = { id: number; name: string; sku: string; price: string };
type SalesItem = { id: number; salesOrderId: number; productId: number; productName: string; sku: string; quantity: number; unitPrice: string; subtotal: string };
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

export default function SalesOrderDetailsPage() {
  return (
    <Suspense fallback={<div className="table-state">Loading sales order…</div>}>
      <SalesOrderDetails />
    </Suspense>
  );
}

function SalesOrderDetails() {
  const { id } = useParams<{ id: string }>();
  const [order, setOrder] = useState<SalesOrder | null>(null);
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [items, setItems] = useState<SalesItem[]>([]);
  const [drafts, setDrafts] = useState<Record<number, { quantity: string; unitPrice: string }>>({});
  const [newItem, setNewItem] = useState({ productId: "", quantity: "1", unitPrice: "" });
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  const loadOrder = useCallback(async (initial = false) => {
    if (initial) setLoading(true);
    setError("");
    try {
      const currentOrder = await request<SalesOrder>(`/api/sales/${id}`);
      const [currentCustomer, currentItems, productList] = await Promise.all([
        request<Customer>(`/api/customer/${currentOrder.customerId}`),
        request<SalesItem[]>(`/api/sales/${id}/items`),
        currentOrder.status === "pending" ? request<Product[]>("/api/product") : Promise.resolve<Product[]>([]),
      ]);
      setOrder(currentOrder);
      setCustomer(currentCustomer);
      setItems(currentItems);
      setProducts(productList);
      setDrafts(Object.fromEntries(currentItems.map((item) => [item.id, {
        quantity: String(item.quantity),
        unitPrice: item.unitPrice,
      }])));
      const completionNotice = window.sessionStorage.getItem("iluf-sales-notice");
      if (completionNotice) {
        setNotice(completionNotice);
        window.sessionStorage.removeItem("iluf-sales-notice");
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not load sales order.");
    } finally {
      if (initial) setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    const timer = window.setTimeout(() => void loadOrder(true), 0);
    return () => window.clearTimeout(timer);
  }, [loadOrder]);

  const pending = order?.status === "pending";
  const availableProducts = products.filter((product) => !items.some((item) => item.productId === product.id));

  function updateDraft(itemId: number, patch: Partial<{ quantity: string; unitPrice: string }>) {
    setDrafts((current) => ({ ...current, [itemId]: { ...current[itemId], ...patch } }));
  }

  async function addItem(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!pending || busy) return;
    setBusy(true);
    setError("");
    setNotice("");
    try {
      await request<SalesItem>(`/api/sales/${id}/items`, {
        method: "POST",
        body: JSON.stringify({
          productId: Number(newItem.productId),
          quantity: Number(newItem.quantity),
          unitPrice: newItem.unitPrice,
        }),
      });
      setNewItem({ productId: "", quantity: "1", unitPrice: "" });
      await loadOrder();
      setNotice("Product added to the sales order.");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not add product.");
    } finally {
      setBusy(false);
    }
  }

  async function saveItem(item: SalesItem) {
    const draft = drafts[item.id];
    if (!pending || busy || !draft) return;
    setBusy(true);
    setError("");
    setNotice("");
    try {
      await request<SalesItem>(`/api/sales/${id}/items/${item.id}`, {
        method: "PATCH",
        body: JSON.stringify({ quantity: Number(draft.quantity), unitPrice: draft.unitPrice }),
      });
      await loadOrder();
      setNotice("Sales item updated.");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not update sales item.");
    } finally {
      setBusy(false);
    }
  }

  async function deleteItem(item: SalesItem) {
    if (!pending || busy || !window.confirm(`Remove ${item.productName} from this order?`)) return;
    setBusy(true);
    setError("");
    setNotice("");
    try {
      await request(`/api/sales/${id}/items/${item.id}`, { method: "DELETE" });
      await loadOrder();
      setNotice("Product removed from the sales order.");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not remove sales item.");
    } finally {
      setBusy(false);
    }
  }

  async function changeStatus(action: "confirm" | "cancel") {
    if (!pending || busy) return;
    const prompt = action === "confirm"
      ? "Confirm this sale? The backend will deduct the sold quantities from inventory."
      : "Cancel this pending sales order?";
    if (!window.confirm(prompt)) return;

    setBusy(true);
    setError("");
    setNotice("");
    try {
      const result = await request<{ message?: string }>(`/api/sales/${id}/${action}`, { method: "POST" });
      await loadOrder();
      setNotice(result?.message || (action === "confirm" ? "Sale confirmed successfully." : "Sales order cancelled."));
    } catch (e) {
      setError(e instanceof Error ? e.message : `Could not ${action} sale.`);
    } finally {
      setBusy(false);
    }
  }

  if (loading) return <div className="table-state">Loading sales order…</div>;
  if (!order) return <><div className="inline-error" role="alert">{error || "Sales order not found."}</div><Link className="secondary-button" href="/admin/sales">Back to sales</Link></>;

  return (
    <div className="sales-order-page">
      <header className="sales-invoice-heading">
        <div><span className="admin-brand-mark"><i/><i/><i/><i/></span><strong>ILUF</strong><small>SALES INVOICE</small></div>
        <div><span>INVOICE</span><strong>SO-{String(order.id).padStart(5, "0")}</strong><small>{new Date(order.createdAt).toLocaleDateString()}</small></div>
      </header>
      <div className="page-heading sales-no-print">
        <div><div className="eyebrow">SALES ORDER · #{order.id}</div><h1>SO-{String(order.id).padStart(5, "0")}</h1><p>{customer?.name ?? `Customer #${order.customerId}`} · Created {new Date(order.createdAt).toLocaleDateString()}</p></div>
        <div className="heading-actions">
          <button className="secondary-button" onClick={() => window.print()}>Print invoice</button>
          <Link className="secondary-button" href="/admin/sales">All sales</Link>
          {pending && <>
            <button className="secondary-button" disabled={busy} onClick={() => void changeStatus("cancel")}>Cancel sale</button>
            <button className="primary-button" disabled={busy || items.length === 0} onClick={() => void changeStatus("confirm")}>{busy ? "Processing…" : "Confirm sale"}</button>
          </>}
        </div>
      </div>
      {notice && <div className="inline-success" role="status">{notice}</div>}
      {error && <div className="inline-error" role="alert">{error}<button onClick={() => setError("")}>Dismiss</button></div>}

      <div className="purchase-detail-meta">
        <div><span>STATUS</span><strong className={`purchase-status ${order.status === "completed" ? "status-received" : `status-${order.status}`}`}>{order.status}</strong></div>
        <div><span>CUSTOMER</span><strong>{customer?.name ?? `Customer #${order.customerId}`}</strong></div>
        <div><span>ORDER DATE</span><strong>{new Date(order.createdAt).toLocaleDateString()}</strong></div>
      </div>

      {customer && <section className="management-panel purchase-notes">
        <div className="eyebrow">CUSTOMER INFORMATION</div>
        <div className="detail-grid">
          <div><span>NAME</span><strong>{customer.name}</strong></div>
          <div><span>EMAIL</span><strong>{customer.email || "—"}</strong></div>
          <div><span>PHONE</span><strong>{customer.phone || "—"}</strong></div>
          <div><span>ADDRESS</span><strong>{customer.address || "—"}</strong></div>
        </div>
      </section>}

      <section className="management-panel purchase-items-panel">
        <div className="section-heading"><div><div className="eyebrow">SALES ITEMS</div><h2>{items.length} {items.length === 1 ? "item" : "items"}</h2></div><button className="secondary-button sales-no-print" onClick={() => window.print()}>Print invoice</button></div>
        {items.length ? (
          <div className="data-table-wrap">
            <table className="data-table">
              <thead><tr><th>PRODUCT</th><th>SKU</th><th>QUANTITY</th><th>UNIT PRICE (৳)</th><th>SUBTOTAL (৳)</th>{pending && <th />}</tr></thead>
              <tbody>{items.map((item) => (
                <tr key={item.id}>
                  <td><strong className="row-title">{item.productName}</strong></td>
                  <td className="mono">{item.sku}</td>
                  <td>{pending ? <input className="inline-number" aria-label={`Quantity for ${item.productName}`} type="number" min="1" step="1" value={drafts[item.id]?.quantity ?? item.quantity} onChange={(event) => updateDraft(item.id, { quantity: event.target.value })} /> : item.quantity}</td>
                  <td>{pending ? <input className="inline-number cost-input" aria-label={`Unit price for ${item.productName}`} type="number" min="0" step="0.01" value={drafts[item.id]?.unitPrice ?? item.unitPrice} onChange={(event) => updateDraft(item.id, { unitPrice: event.target.value })} /> : formatCurrency(item.unitPrice)}</td>
                  <td>{formatCurrency(item.subtotal)}</td>
                  {pending && <td className="row-actions"><button disabled={busy} onClick={() => void saveItem(item)}>Save</button><button disabled={busy} onClick={() => void deleteItem(item)}>Remove</button></td>}
                </tr>
              ))}</tbody>
              <tfoot>
                <tr><td colSpan={pending ? 4 : 3}>Subtotal</td><td colSpan={pending ? 2 : 1}><strong>{formatCurrency(order.subtotal)}</strong></td></tr>
                <tr><td colSpan={pending ? 4 : 3}>Discount</td><td colSpan={pending ? 2 : 1}><strong>{formatCurrency(order.discount)}</strong></td></tr>
                <tr><td colSpan={pending ? 4 : 3}>Total</td><td colSpan={pending ? 2 : 1}><strong>{formatCurrency(order.totalAmount)}</strong></td></tr>
              </tfoot>
            </table>
          </div>
        ) : <div className="table-state">This order has no items yet.</div>}
      </section>

      {pending && <section className="management-panel add-purchase-item sales-no-print">
        <div className="section-heading"><div><div className="eyebrow">EDIT PENDING ORDER</div><h2>Add product</h2></div></div>
        {availableProducts.length ? (
          <form className="admin-form" onSubmit={addItem}>
            <label>Product<select required value={newItem.productId} onChange={(event) => {
              const product = products.find((candidate) => candidate.id === Number(event.target.value));
              setNewItem((current) => ({ ...current, productId: event.target.value, unitPrice: product?.price ?? "" }));
            }}><option value="" disabled>Select product</option>{availableProducts.map((product) => <option key={product.id} value={product.id}>{product.name} · {product.sku}</option>)}</select></label>
            <label>Quantity<input type="number" min="1" step="1" required value={newItem.quantity} onChange={(event) => setNewItem((current) => ({ ...current, quantity: event.target.value }))} /></label>
            <label>Unit price (৳)<input type="number" min="0" step="0.01" required value={newItem.unitPrice} onChange={(event) => setNewItem((current) => ({ ...current, unitPrice: event.target.value }))} /></label>
            <div className="dialog-actions span-two"><button className="primary-button" disabled={busy || !newItem.productId}>{busy ? "Adding…" : "Add product"}</button></div>
          </form>
        ) : <div className="table-state">{products.length ? "Every product is already in this sales order." : "No products are available."}</div>}
      </section>}
    </div>
  );
}
