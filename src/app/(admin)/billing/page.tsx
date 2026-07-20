"use client";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { DataTable } from "@/components/data-table/data-table";
import { getCoreRowModel, useReactTable, type ColumnDef } from "@tanstack/react-table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/confirm-dialog";
import { PageHeader } from "@/components/layout/page-header";
import { useI18n } from "@/lib/i18n/i18n-context";
interface Sub { id: string; plan?: string; status?: string; }
export default function BillingPage() {
	const { t } = useI18n();
	const qc = useQueryClient();
	const { data } = useQuery({
		queryKey: ["subscriptions"],
		queryFn: async () => { const r = await fetch("/api/admin/subscriptions"); const d = await r.json(); return d.ok ? d.data?.subscriptions ?? [] : []; },
	});
	const subs: Sub[] = data ?? [];
	const cancel = async (id: string) => {
		const r = await fetch("/api/admin/subscriptions", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ action: "cancel", subscriptionId: id }) });
		if (r.ok) { toast.success(t("billing.canceled")); await qc.invalidateQueries({ queryKey: ["subscriptions"] }); }
		else { toast.error(t("toast.actionFailed")); }
	};
	const columns: ColumnDef<Sub>[] = [
		{ accessorKey: "plan", header: t("billing.plan"), cell: ({ row }) => row.original.plan ?? "—" },
		{ accessorKey: "status", header: t("billing.status"), cell: ({ row }) => <Badge variant={row.original.status === "active" ? "success" : "muted"}>{row.original.status ?? "—"}</Badge> },
		{ id: "actions", header: "", cell: ({ row }) => row.original.status === "active" ? <ConfirmDialog trigger={<Button variant="ghost" size="sm" className="text-danger">{t("billing.cancel")}</Button>} title={t("billing.cancel")} danger confirmText={t("billing.cancel")} onConfirm={() => cancel(row.original.id)} /> : null },
	];
	const table = useReactTable({ data: subs, columns, getCoreRowModel: getCoreRowModel() });
	return (
		<div><PageHeader title={t("billing.title")} /><DataTable table={table} emptyLabel={t("billing.empty")} /></div>
	);
}
