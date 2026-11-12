"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import { formatCurrency } from "@/lib/currency";

type SalesOrder = {
  id: number;
  customerId: number;
  customerName: string;
  status: string;
  subtotal: string;
  discount: string;
  totalAmount: string;
  createdAt: string;
};

type ApiResult<T> = { success?: boolean; data?: T; message?: string };

async function request<T>(url: string): Promise<T> {
  const response = await fetch(url);
  const body = await response.json().catch(() => ({})) as ApiResult<T>;
  if (!response.ok || body.success === false) {
    throw new Error(body.message || "The request could not be completed.");
  }
  return body.data as T;
}

export default function SalesPage() {
  const [orders, setOrders] = useState<SalesOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");

  const loadOrders = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      setOrders(await request<SalesOrder[]>("/api/sales"));
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not load sales orders.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const timer = window.setTimeout(() => void loadOrders(), 0);
    return () => window.clearTimeout(timer);
  }, [loadOrders]);

  const completed = useMemo(() => orders.filter((order) => order.status === "completed"), [orders]);
  const pending = useMemo(() => orders.filter((order) => order.status === "pending"), [orders]);
  const revenue = useMemo(
    () => completed.reduce((total, order) => total + Number(order.totalAmount), 0),
    [completed],
  );
  const filteredOrders = useMemo(() => {
    const search = query.trim().toLowerCase();
    return orders.filter((order) => {
      const matchesSearch = !search ||
        `so-${String(order.id).padStart(5, "0")} ${order.id} ${order.customerName}`
          .toLowerCase().includes(search);
      const date = new Date(order.createdAt).toISOString().slice(0, 10);
      return matchesSearch &&
        (!statusFilter || order.status === statusFilter) &&
        (!fromDate || date >= fromDate) &&
        (!toDate || date <= toDate);
    });
  }, [orders, query, statusFilter, fromDate, toDate]);

  return (
    <div className="sales-dashboard">
      <div className="page-heading">
        <div>
          <div className="eyebrow">SALES MANAGEMENT</div>
          <h1>Sales</h1>
          <p>Monitor transactions and manage your checkout workflow.</p>
        </div>
        <div className="heading-actions">
          <Link className="secondary-button" href="/admin/sales/customers">Manage customers</Link>
          <Link className="primary-button" href="/admin/sales/new">＋ New sale</Link>
        </div>
      </div>

      {error && <div className="inline-error" role="alert">{error}<button onClick={() => void loadOrders()}>Retry</button></div>}

      <div className="summary-grid sales-kpis">
        {[
          { label: "Total revenue", value: formatCurrency(revenue), note: "Completed sales only", icon: "৳" },
          { label: "Total orders", value: orders.length.toLocaleString(), note: "All sales orders", icon: "▥" },
          { label: "Completed sales", value: completed.length.toLocaleString(), note: "Confirmed transactions", icon: "✓" },
          { label: "Pending orders", value: pending.length.toLocaleString(), note: "Awaiting confirmation", icon: "◷" },
        ].map((stat) => (
          <article className="summary-card" key={stat.label}>
            <div className="summary-card-top"><span className="summary-icon">{stat.icon}</span><span className="eyebrow">LIVE</span></div>
            <p>{stat.label}</p>
            <strong>{loading ? "—" : stat.value}</strong>
            <small>{stat.note}</small>
          </article>
        ))}
      </div>

      <section className="management-panel sales-transactions">
        <div className="sales-panel-heading">
          <div><div className="eyebrow">SALES HISTORY</div><h2>Recent transactions</h2><p>{loading ? "Loading orders…" : `${filteredOrders.length} of ${orders.length} orders`}</p></div>
          <Link href="/admin/sales/customers" className="secondary-button">Customers</Link>
        </div>
        <div className="sales-filters">
          <label className="table-search"><span aria-hidden="true">⌕</span><input aria-label="Search order ID or customer" placeholder="Search order ID or customer" value={query} onChange={(event) => setQuery(event.target.value)} /></label>
          <select aria-label="Filter by status" value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)}>
            <option value="">All statuses</option><option value="pending">Pending</option><option value="completed">Completed</option><option value="cancelled">Cancelled</option>
          </select>
          <label className="sales-date-filter"><span>From</span><input type="date" aria-label="From date" value={fromDate} max={toDate || undefined} onChange={(event) => setFromDate(event.target.value)} /></label>
          <label className="sales-date-filter"><span>To</span><input type="date" aria-label="To date" value={toDate} min={fromDate || undefined} onChange={(event) => setToDate(event.target.value)} /></label>
        </div>
        {loading ? <div className="sales-loading-list" aria-label="Loading transactions">{[0, 1, 2, 3].map((item) => <div key={item} />)}</div> : filteredOrders.length ? (
          <div className="data-table-wrap">
            <table className="data-table sales-table">
              <thead><tr><th>ORDER</th><th>CUSTOMER</th><th>DATE</th><th>SUBTOTAL</th><th>DISCOUNT</th><th>TOTAL</th><th>STATUS</th><th /></tr></thead>
              <tbody>{filteredOrders.map((order) => (
                <tr key={order.id}>
                  <td><Link className="row-title" href={`/admin/sales/${order.id}`}>SO-{String(order.id).padStart(5, "0")}</Link></td>
                  <td>{order.customerName}</td>
                  <td>{new Date(order.createdAt).toLocaleDateString()}</td>
                  <td>{formatCurrency(order.subtotal)}</td>
                  <td>{formatCurrency(order.discount)}</td>
                  <td className="sales-total-cell">{formatCurrency(order.totalAmount)}</td>
                  <td><span className={`purchase-status ${order.status === "completed" ? "status-received" : `status-${order.status}`}`}>{order.status}</span></td>
                  <td className="row-actions"><Link href={`/admin/sales/${order.id}`}>View details</Link></td>
                </tr>
              ))}</tbody>
            </table>
          </div>
        ) : <div className="sales-empty-state"><span>▤</span><strong>{orders.length ? "No transactions match these filters" : "No sales yet"}</strong><p>{orders.length ? "Try changing the search or filters." : "Create a sale to start building your transaction history."}</p>{!orders.length && <Link className="primary-button" href="/admin/sales/new">Start a sale</Link>}</div>}
      </section>
    </div>
  );
}
