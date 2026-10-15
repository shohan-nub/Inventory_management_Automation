import { Suspense } from "react";
import { PurchaseDetailRoute } from "@/app/components/admin/admin-operations";

export default function PurchaseDetailPage() {
  return <Suspense fallback={<div className="table-state">Loading purchase…</div>}><PurchaseDetailRoute /></Suspense>;
}
