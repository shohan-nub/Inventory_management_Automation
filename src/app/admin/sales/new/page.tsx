"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useState, type FormEvent } from "react";
import { formatCurrency } from "@/lib/currency";

type Customer = { id: number; name: string; email: string | null; phone: string | null; address: string | null };
type Product = { id: number; name: string; sku: string; price: string };
type Stock = { productId: number; quantity: number };
type CartLine = { product: Product; quantity: number; unitPrice: string };
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

function lineSubtotal(line: CartLine) {
  return Math.round(Number(line.unitPrice) * 100) * line.quantity / 100;
}

export default function NewSalePage() {
  const router = useRouter();
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [stock, setStock] = useState<Stock[]>([]);
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [customerSearch, setCustomerSearch] = useState("");
  const [customerMenuOpen, setCustomerMenuOpen] = useState(false);
  const [productSearch, setProductSearch] = useState("");
  const [cart, setCart] = useState<CartLine[]>([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [showNewCustomer, setShowNewCustomer] = useState(false);
  const [showCheckoutConfirm, setShowCheckoutConfirm] = useState(false);
  const [customerSaving, setCustomerSaving] = useState(false);
  const [customerFormError, setCustomerFormError] = useState("");
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [createdOrderId, setCreatedOrderId] = useState<number | null>(null);

  const loadCatalog = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const [customerList, productList, inventory] = await Promise.all([
        request<Customer[]>("/api/customer"),
        request<Product[]>("/api/product"),
        request<Stock[]>("/api/inventory"),
      ]);
      setCustomers(customerList);
      setProducts(productList);
      setStock(inventory);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not load checkout data.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const timer = window.setTimeout(() => void loadCatalog(), 0);
    return () => window.clearTimeout(timer);
  }, [loadCatalog]);

  const stockByProduct = useMemo(() => new Map(stock.map((item) => [item.productId, item.quantity])), [stock]);
  const visibleProducts = useMemo(() => {
    const search = productSearch.trim().toLowerCase();
    return products.filter((product) =>
      `${product.name} ${product.sku}`.toLowerCase().includes(search),
    );
  }, [products, productSearch]);
  const matchingCustomers = useMemo(() => {
    const search = customerSearch.trim().toLowerCase();
    return customers.filter((entry) =>
      `${entry.name} ${entry.email ?? ""} ${entry.phone ?? ""}`.toLowerCase().includes(search),
    ).slice(0, 7);
  }, [customers, customerSearch]);

  const subtotal = useMemo(
    () => cart.reduce((total, line) => total + Math.round(Number(line.unitPrice) * 100) * line.quantity, 0) / 100,
    [cart],
  );
  const hasStockIssue = cart.some((line) => {
    const available = stockByProduct.get(line.product.id);
    return available === undefined || line.quantity > available;
  });

  function addProduct(product: Product) {
    const available = stockByProduct.get(product.id);
    setError("");
    if (available === undefined) {
      setError(`Stock information is unavailable for ${product.name}; it cannot be added.`);
      return;
    }
    if (available < 1) {
      setError(`${product.name} is out of stock.`);
      return;
    }
    const existing = cart.find((line) => line.product.id === product.id);
    if (existing) {
      if (existing.quantity >= available) {
        setError(`Only ${available} ${available === 1 ? "unit is" : "units are"} available for ${product.name}.`);
        return;
      }
      setCart((current) => current.map((line) => line.product.id === product.id
        ? { ...line, quantity: line.quantity + 1 }
        : line));
      return;
    }
    setCart((current) => [...current, { product, quantity: 1, unitPrice: product.price }]);
  }

  function updateLine(productId: number, patch: Partial<Pick<CartLine, "quantity" | "unitPrice">>) {
    setCart((current) => current.map((line) => line.product.id === productId ? { ...line, ...patch } : line));
    setError("");
  }

  async function createCustomer(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (customerSaving) return;
    const form = new FormData(event.currentTarget);
    setCustomerSaving(true);
    setCustomerFormError("");
    setError("");
    try {
      const created = await request<Customer>("/api/customer", {
        method: "POST",
        body: JSON.stringify({
          name: String(form.get("name") ?? "").trim(),
          email: String(form.get("email") ?? "").trim(),
          phone: String(form.get("phone") ?? "").trim(),
          address: String(form.get("address") ?? "").trim(),
        }),
      });
      setCustomers((current) => [...current, created]);
      setCustomer(created);
      setCustomerSearch("");
      setCustomerMenuOpen(false);
      setShowNewCustomer(false);
      setNotice("Customer created and selected. Your cart is unchanged.");
    } catch (e) {
      setCustomerFormError(e instanceof Error ? e.message : "Could not create customer.");
    } finally {
      setCustomerSaving(false);
    }
  }

  async function checkout() {
    if (!customer || cart.length === 0 || hasStockIssue || busy || createdOrderId) return;
    setBusy(true);
    setError("");
    setNotice("");
    setShowCheckoutConfirm(false);
    let orderId: number | null = null;
    try {
      const order = await request<{ id: number }>("/api/sales", {
        method: "POST",
        body: JSON.stringify({ customerId: customer.id }),
      });
      orderId = order.id;
      setCreatedOrderId(order.id);

      for (const line of cart) {
        await request(`/api/sales/${order.id}/items`, {
          method: "POST",
          body: JSON.stringify({
            productId: line.product.id,
            quantity: line.quantity,
            unitPrice: line.unitPrice,
          }),
        });
      }

      await request(`/api/sales/${order.id}/confirm`, { method: "POST" });
      window.sessionStorage.setItem("iluf-sales-notice", "Sale completed. Inventory was updated by the sales workflow.");
      router.push(`/admin/sales/${order.id}`);
    } catch (e) {
      const message = e instanceof Error ? e.message : "Checkout could not be completed.";
      if (orderId !== null) {
        setError(`${message} Order #${orderId} was created and may contain some saved items. Review it before retrying.`);
      } else {
        setError(message);
      }
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="sales-pos-page">
      <div className="page-heading sales-pos-heading">
        <div><div className="eyebrow">POINT OF SALE</div><h1>New sale</h1><p>Build a cart, select a customer, and complete the sale.</p></div>
        <Link className="secondary-button" href="/admin/sales">Back to sales</Link>
      </div>
      {notice && <div className="inline-success" role="status">{notice}</div>}
      {error && <div className="inline-error" role="alert">{error}{createdOrderId && <Link href={`/admin/sales/${createdOrderId}`}>Review order SO-{String(createdOrderId).padStart(5, "0")} →</Link>}</div>}

      <div className="sales-pos-layout">
        <section className="management-panel sales-catalog">
          <div className="sales-pos-section-heading">
            <div><div className="eyebrow">CATALOG</div><h2>Add products</h2></div>
            <span className="sales-count">{loading ? "…" : `${visibleProducts.length} products`}</span>
          </div>
          <label className="sales-search"><span aria-hidden="true">⌕</span><input aria-label="Search products" placeholder="Search products by name or SKU" value={productSearch} onChange={(event) => setProductSearch(event.target.value)} /><kbd>/</kbd></label>
          {loading ? <div className="sales-loading-list" aria-label="Loading products">{[0, 1, 2, 3].map((item) => <div key={item} />)}</div> : visibleProducts.length ? (
            <div className="sales-product-list">
              {visibleProducts.map((product) => {
                const available = stockByProduct.get(product.id);
                const inCart = cart.find((line) => line.product.id === product.id);
                return (
                  <article className={`sales-product-card ${available === undefined || available === 0 ? "is-unavailable" : ""}`} key={product.id}>
                    <span className="sales-product-monogram">{product.name.slice(0, 1).toUpperCase()}</span>
                    <div className="sales-product-info"><strong>{product.name}</strong><span>{product.sku}</span><small>{available === undefined ? "Stock unavailable" : available === 0 ? "Out of stock" : `${available} available`}</small></div>
                    <div className="sales-product-price"><strong>{formatCurrency(product.price)}</strong><button className="sales-add-button" disabled={loading || busy || available === undefined || available < 1} onClick={() => addProduct(product)}>{inCart ? `Add · ${inCart.quantity} in cart` : "＋ Add"}</button></div>
                  </article>
                );
              })}
            </div>
          ) : <div className="sales-empty-state"><span>▦</span><strong>{products.length ? "No matching products" : "No products available"}</strong><p>{products.length ? "Try another search." : "Create products before starting a sale."}</p></div>}
        </section>

        <aside className="management-panel sales-checkout">
          <div className="sales-pos-section-heading">
            <div><div className="eyebrow">CURRENT SALE</div><h2>Checkout</h2></div>
            <span className="sales-count">{cart.length} {cart.length === 1 ? "item" : "items"}</span>
          </div>

          <div className="sales-customer-picker">
            <div className="sales-subheading"><strong>Customer</strong><button type="button" className="text-button" onClick={() => { setShowNewCustomer(true); setError(""); }}>＋ New customer</button></div>
            {customer ? (
              <div className="sales-selected-customer">
                <span className="sales-customer-avatar">{customer.name.slice(0, 1).toUpperCase()}</span>
                <span><strong>{customer.name}</strong><small>{[customer.email, customer.phone, customer.address].filter(Boolean).join(" · ") || "Customer selected"}</small></span>
                <button type="button" aria-label="Change customer" onClick={() => { setCustomer(null); setCustomerSearch(""); setCustomerMenuOpen(true); }}>Change</button>
              </div>
            ) : (
              <div className="sales-customer-search-wrap">
                <label className="sales-search"><span aria-hidden="true">⌕</span><input aria-label="Search customer" placeholder="Search customers…" value={customerSearch} onFocus={() => setCustomerMenuOpen(true)} onChange={(event) => { setCustomerSearch(event.target.value); setCustomerMenuOpen(true); }} /></label>
                {customerMenuOpen && <div className="sales-customer-results">
                  {matchingCustomers.map((entry) => <button type="button" key={entry.id} onClick={() => { setCustomer(entry); setCustomerSearch(""); setCustomerMenuOpen(false); }}><strong>{entry.name}</strong><small>{entry.email || entry.phone || "Customer"}</small></button>)}
                  {matchingCustomers.length === 0 && <p>{customers.length ? "No matching customers." : "No customers found."}</p>}
                  <Link href="/admin/sales/customers">Manage customers →</Link>
                </div>}
              </div>
            )}
          </div>

          <div className="sales-cart">
            {cart.length ? cart.map((line) => {
              const available = stockByProduct.get(line.product.id);
              const overStock = available === undefined || line.quantity > available;
              return (
                <div className="sales-cart-line" key={line.product.id}>
                  <div className="sales-cart-line-heading">
                    <span><strong>{line.product.name}</strong><small>{formatCurrency(line.unitPrice)} each · {available ?? 0} in stock</small></span>
                    <strong>{formatCurrency(lineSubtotal(line))}</strong>
                  </div>
                  <div className="sales-cart-line-controls">
                    <div className="sales-quantity-control">
                      <button type="button" aria-label={`Decrease ${line.product.name} quantity`} disabled={line.quantity <= 1} onClick={() => updateLine(line.product.id, { quantity: line.quantity - 1 })}>−</button>
                      <input aria-label={`Quantity for ${line.product.name}`} type="number" min="1" step="1" value={line.quantity} onChange={(event) => updateLine(line.product.id, { quantity: Math.max(1, Number(event.target.value) || 1) })} />
                      <button type="button" aria-label={`Increase ${line.product.name} quantity`} onClick={() => updateLine(line.product.id, { quantity: line.quantity + 1 })}>＋</button>
                    </div>
                    <label className="sales-unit-price"><span>Price</span><input aria-label={`Unit price for ${line.product.name}`} type="number" min="0" step="0.01" value={line.unitPrice} onChange={(event) => updateLine(line.product.id, { unitPrice: event.target.value })} /></label>
                    <button className="sales-remove-button" type="button" onClick={() => setCart((current) => current.filter((entry) => entry.product.id !== line.product.id))}>Remove</button>
                  </div>
                  {overStock && <p className="sales-stock-warning" role="alert">{available === undefined ? "Inventory information is missing." : `Only ${available} available; reduce quantity to continue.`}</p>}
                </div>
              );
            }) : <div className="sales-cart-empty"><span>＋</span><strong>Your cart is empty</strong><p>Select products to add them to this sale.</p></div>}
          </div>

          <div className="sales-totals">
            <div><span>Subtotal</span><strong>{formatCurrency(subtotal)}</strong></div>
            <div><span>Discount <small>not supported by sales API</small></span><strong>{formatCurrency(0)}</strong></div>
            <div className="sales-grand-total"><span>Total</span><strong>{formatCurrency(subtotal)}</strong></div>
          </div>
          <p className="sales-checkout-note">Payment is not recorded by the current sales workflow. Confirming a sale updates its status and deducts stock.</p>
          {createdOrderId ? <Link className="primary-button sales-confirm-button" href={`/admin/sales/${createdOrderId}`}>Review created order</Link> : <button className="primary-button sales-confirm-button" disabled={!customer || cart.length === 0 || hasStockIssue || busy || loading} onClick={() => setShowCheckoutConfirm(true)}>{busy ? "Completing sale…" : "Review and confirm sale"}</button>}
        </aside>
      </div>

      {showNewCustomer && <div className="dialog-backdrop" onMouseDown={(event) => { if (event.target === event.currentTarget && !customerSaving) setShowNewCustomer(false); }}>
        <section className="form-dialog" role="dialog" aria-modal="true" aria-labelledby="pos-customer-title">
          <div className="dialog-heading"><div><div className="eyebrow">CUSTOMER RECORD</div><h2 id="pos-customer-title">Add customer</h2></div><button type="button" className="icon-button" disabled={customerSaving} onClick={() => setShowNewCustomer(false)} aria-label="Close dialog">×</button></div>
          <p className="sales-dialog-note">Your current cart will be kept while you add a customer.</p>
          <form className="admin-form" onSubmit={createCustomer}>
            <label className="span-two">Customer name<input name="name" required maxLength={180} /></label>
            <label>Email<input name="email" type="email" maxLength={254} /></label>
            <label>Phone<input name="phone" maxLength={80} /></label>
            <label className="span-two">Address<textarea name="address" rows={3} maxLength={1000} /></label>
            {customerFormError && <div className="inline-error span-two" role="alert">{customerFormError}</div>}
            <div className="dialog-actions span-two"><button type="button" className="secondary-button" disabled={customerSaving} onClick={() => setShowNewCustomer(false)}>Cancel</button><button className="primary-button" disabled={customerSaving}>{customerSaving ? "Saving…" : "Create customer"}</button></div>
          </form>
        </section>
      </div>}

      {showCheckoutConfirm && <div className="dialog-backdrop" onMouseDown={(event) => { if (event.target === event.currentTarget && !busy) setShowCheckoutConfirm(false); }}>
        <section className="form-dialog sales-confirm-dialog" role="dialog" aria-modal="true" aria-labelledby="pos-confirm-title">
          <div className="dialog-heading"><div><div className="eyebrow">FINAL CHECK</div><h2 id="pos-confirm-title">Confirm this sale?</h2></div><button type="button" className="icon-button" disabled={busy} onClick={() => setShowCheckoutConfirm(false)} aria-label="Close dialog">×</button></div>
          <p className="sales-dialog-note">This will save the order and confirm it. The backend will validate stock and deduct inventory. Payment will not be recorded.</p>
          <div className="sales-confirm-summary"><span>{cart.length} {cart.length === 1 ? "product" : "products"} · {customer?.name}</span><strong>{formatCurrency(subtotal)}</strong></div>
          <div className="dialog-actions"><button type="button" className="secondary-button" disabled={busy} onClick={() => setShowCheckoutConfirm(false)}>Keep editing</button><button className="primary-button" disabled={busy} onClick={() => void checkout()}>{busy ? "Processing…" : "Confirm sale"}</button></div>
        </section>
      </div>}
    </div>
  );
}
