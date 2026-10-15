"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Suspense, useState, type ReactNode } from "react";

const links = [
  { href: "/admin", label: "Dashboard", icon: "◫" },
  { href: "/admin/products", label: "Products", icon: "▦" },
  { href: "/admin/categories", label: "Categories", icon: "◈" },
  { href: "/admin/inventory", label: "Inventory", icon: "▤" },
];

function AdminNavigation({ onNavigate }: { onNavigate: () => void }) {
  const pathname = usePathname();
  return <nav className="sidebar-nav" aria-label="Admin navigation">
    {links.map((item) => {
      const active = item.href === "/admin" ? pathname === item.href : pathname.startsWith(item.href);
      return <Link key={item.href} href={item.href} onClick={onNavigate} className={`sidebar-link ${active ? "active" : ""}`}><span className="nav-icon" aria-hidden="true">{item.icon}</span>{item.label}</Link>;
    })}
  </nav>;
}

export function AdminShell({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="admin-app">
      {open && <button className="admin-scrim" aria-label="Close navigation" onClick={() => setOpen(false)} />}
      <aside className={`admin-sidebar ${open ? "is-open" : ""}`}>
        <div className="admin-brand-row">
          <Link href="/admin" className="admin-brand"><span className="admin-brand-mark"><i/><i/><i/><i/></span><span>Stockroom<small>INVENTORY WORKSPACE</small></span></Link>
          <button className="sidebar-close" aria-label="Close menu" onClick={() => setOpen(false)}>×</button>
        </div>
        <div className="sidebar-label">WORKSPACE</div>
        <Suspense fallback={<nav className="sidebar-nav" aria-label="Admin navigation" /> }><AdminNavigation onNavigate={() => setOpen(false)} /></Suspense>
        <div className="sidebar-spacer" />
        <div className="sidebar-profile"><span className="avatar avatar-small">S</span><span><strong>Workspace</strong><small>Inventory admin</small></span></div>
      </aside>
      <main className="admin-main">
        <header className="admin-header">
          <button className="mobile-menu" aria-label="Open navigation" onClick={() => setOpen(true)}>☰</button>
          <div className="header-title"><span>Workspace <i>/</i> Admin</span><strong>Inventory workspace</strong></div>
          <div className="header-spacer" />
          <Link href="/" className="header-home">View storefront <span>↗</span></Link>
          <span className="avatar">S</span>
        </header>
        <div className="admin-content">{children}</div>
      </main>
    </div>
  );
}
