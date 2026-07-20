"use client";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { DataTable } from "@/components/data-table/data-table";
import { getCoreRowModel, useReactTable, type ColumnDef } from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/confirm-dialog";
import { PageHeader } from "@/components/layout/page-header";
import { useI18n } from "@/lib/i18n/i18n-context";
interface ScimConn { id: string; provider?: string; token?: string; }
export default function ScimPage() {
	const { t } = useI18n();
	const qc = useQueryClient();
	const { data } = useQuery({
		queryKey: ["scim-tokens"],
		queryFn: async () => { const r = await fetch("/api/admin/scim/tokens"); const d = await r.json(); return d.ok ? d.data?.connections ?? [] : []; },
	});
	const conns: ScimConn[] = data ?? [];
	const gen = async () => {
		const r = await fetch("/api/admin/scim/tokens", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({}) });
		const d = await r.json().catch(() => ({}));
		if (d.ok && d.data?.token) { navigator.clipboard?.writeText(d.data.token); toast.success(t("scim.tokenCopied")); await qc.invalidateQueries({ queryKey: ["scim-tokens"] }); }
		else { toast.error(t("toast.actionFailed")); }
	};
	const del = async (id: string) => {
		const r = await fetch(`/api/admin/scim/tokens/${id}`, { method: "DELETE" });
		if (!r.ok) toast.error(t("toast.deleteFailed"));
		await qc.invalidateQueries({ queryKey: ["scim-tokens"] });
	};
	const columns: ColumnDef<ScimConn>[] = [
		{ accessorKey: "provider", header: t("scim.provider"), cell: ({ row }) => row.original.provider ?? "—" },
		{ accessorKey: "id", header: "ID", cell: ({ row }) => <span className="font-mono text-xs">{row.original.id.slice(0, 16)}…</span> },
		{ id: "actions", header: "", cell: ({ row }) => <ConfirmDialog trigger={<Button variant="ghost" size="sm" className="text-danger">{t("common.delete")}</Button>} title={t("common.delete")} danger confirmText={t("common.delete")} onConfirm={() => del(row.original.id)} /> },
	];
	const table = useReactTable({ data: conns, columns, getCoreRowModel: getCoreRowModel() });
	return (
		<div className="max-w-3xl">
			<PageHeader title={t("scim.title")}><Button variant="primary" size="sm" onClick={gen}>{t("scim.generateToken")}</Button></PageHeader>
			<DataTable table={table} emptyLabel={t("scim.empty")} />
		</div>
	);
}
