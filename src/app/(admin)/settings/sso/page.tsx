"use client";
import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { DataTable } from "@/components/data-table/data-table";
import { getCoreRowModel, useReactTable, type ColumnDef } from "@tanstack/react-table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ConfirmDialog } from "@/components/confirm-dialog";
import { PageHeader } from "@/components/layout/page-header";
import { useI18n } from "@/lib/i18n/i18n-context";

interface SsoProvider { id: string; name: string; domain?: string; entityId?: string; verified?: boolean; }
export default function SsoPage() {
	const { t } = useI18n();
	const qc = useQueryClient();
	const [name, setName] = useState("");
	const [domain, setDomain] = useState("");
	const [entityId, setEntityId] = useState("");
	const { data } = useQuery({
		queryKey: ["sso-providers"],
		queryFn: async () => { const r = await fetch("/api/admin/sso/providers"); const d = await r.json(); return d.ok ? d.data?.providers ?? [] : []; },
	});
	const providers: SsoProvider[] = data ?? [];
	const create = async () => {
		const r = await fetch("/api/admin/sso/providers", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ name, domain, entityId }) });
		if (r.ok) { toast.success(t("common.saved")); setName(""); setDomain(""); setEntityId(""); await qc.invalidateQueries({ queryKey: ["sso-providers"] }); }
	};
	const del = async (id: string) => { await fetch(`/api/admin/sso/providers/${id}`, { method: "DELETE" }); await qc.invalidateQueries({ queryKey: ["sso-providers"] }); };
	const verifyDomain = async (p: SsoProvider) => {
		const r = await fetch("/api/admin/sso/domain-verification", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ action: "verify", domain: p.domain, providerId: p.id }) });
		if (r.ok) { toast.success(t("sso.verified")); await qc.invalidateQueries({ queryKey: ["sso-providers"] }); }
	};
	const columns: ColumnDef<SsoProvider>[] = [
		{ accessorKey: "name", header: t("sso.providerName") },
		{ accessorKey: "domain", header: t("sso.domain"), cell: ({ row }) => row.original.domain ?? "—" },
		{ accessorKey: "entityId", header: t("sso.entityId"), cell: ({ row }) => row.original.entityId ?? "—" },
		{ header: t("sso.status"), cell: ({ row }) => row.original.verified ? <Badge variant="success">{t("sso.verified")}</Badge> : <Badge variant="warning">{t("sso.pending")}</Badge> },
		{ id: "actions", header: "", cell: ({ row }) => (
			<div className="flex gap-1">
				{!row.original.verified && row.original.domain && <Button variant="ghost" size="sm" onClick={() => verifyDomain(row.original)}>{t("sso.verifyDomain")}</Button>}
				<ConfirmDialog trigger={<Button variant="ghost" size="sm" className="text-danger">{t("common.delete")}</Button>} title={t("common.delete")} danger confirmText={t("common.delete")} onConfirm={() => del(row.original.id)} />
			</div>
		) },
	];
	const table = useReactTable({ data: providers, columns, getCoreRowModel: getCoreRowModel() });
	return (
		<div className="max-w-3xl">
			<PageHeader title={t("sso.title")} />
			<div className="mb-4 space-y-3 rounded-[var(--radius-lg)] border border-hairline bg-canvas p-4">
				<div className="grid grid-cols-3 gap-3">
					<div><Label>{t("sso.providerName")}</Label><Input value={name} onChange={(e) => setName(e.target.value)} /></div>
					<div><Label>{t("sso.domain")}</Label><Input value={domain} onChange={(e) => setDomain(e.target.value)} /></div>
					<div><Label>{t("sso.entityId")}</Label><Input value={entityId} onChange={(e) => setEntityId(e.target.value)} /></div>
				</div>
				<Button variant="primary" size="sm" onClick={create}>{t("sso.addProvider")}</Button>
			</div>
			<DataTable table={table} emptyLabel={t("sso.empty")} />
		</div>
	);
}
