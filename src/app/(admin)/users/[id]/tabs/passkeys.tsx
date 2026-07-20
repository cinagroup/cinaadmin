"use client";

import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
	getCoreRowModel,
	useReactTable,
	type ColumnDef,
} from "@tanstack/react-table";
import { DataTable } from "@/components/data-table/data-table";
import { RoleGuard } from "@/components/role-guard";
import { ConfirmDialog } from "@/components/confirm-dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
	Dialog,
	DialogContent,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import { useI18n } from "@/lib/i18n/i18n-context";

interface PasskeyDTO {
	id: string;
	name: string;
	deviceType?: string;
	createdAt: string;
	lastUsedAt?: string | null;
}

export function PasskeysTab({ userId }: { userId: string }) {
	const { t } = useI18n();
	const qc = useQueryClient();
	const [renameId, setRenameId] = useState<string | null>(null);
	const [renameValue, setRenameValue] = useState("");

	const { data, isFetching } = useQuery({
		queryKey: ["user", userId, "passkeys"],
		queryFn: async () => {
			const r = await fetch(`/api/admin/users/${userId}/passkeys`);
			const d = (await r.json()) as { ok: boolean; data?: { passkeys?: PasskeyDTO[] } };
			return d.ok ? d.data?.passkeys ?? [] : [];
		},
	});

	const passkeys = data ?? [];

	const revoke = async (id: string) => {
		await fetch(`/api/admin/users/${userId}/passkeys/${id}`, { method: "DELETE" });
		await qc.invalidateQueries({ queryKey: ["user", userId, "passkeys"] });
	};

	const doRename = async () => {
		if (!renameId || !renameValue.trim()) return;
		const r = await fetch(`/api/admin/users/${userId}/passkeys/${renameId}/rename`, {
			method: "POST",
			headers: { "content-type": "application/json" },
			body: JSON.stringify({ name: renameValue }),
		});
		if (r.ok) {
			toast.success(t("common.saved"));
			setRenameId(null);
			await qc.invalidateQueries({ queryKey: ["user", userId, "passkeys"] });
		}
	};

	const columns: ColumnDef<PasskeyDTO>[] = [
		{ accessorKey: "name", header: t("passkeys.col.name") },
		{
			accessorKey: "deviceType",
			header: t("passkeys.col.device"),
			cell: ({ row }) => row.original.deviceType ?? "—",
		},
		{
			accessorKey: "createdAt",
			header: t("passkeys.col.createdAt"),
			cell: ({ row }) => new Date(row.original.createdAt).toLocaleDateString(),
		},
		{
			accessorKey: "lastUsedAt",
			header: t("passkeys.col.lastUsedAt"),
			cell: ({ row }) =>
				row.original.lastUsedAt
					? new Date(row.original.lastUsedAt).toLocaleDateString()
					: "—",
		},
		{
			id: "actions",
			header: "",
			cell: ({ row }) => (
				<div className="flex items-center gap-2">
					<RoleGuard allow={["super_admin"]}>
						<Button
							variant="ghost"
							size="sm"
							onClick={() => {
								setRenameId(row.original.id);
								setRenameValue(row.original.name);
							}}
						>
							{t("common.edit")}
						</Button>
					</RoleGuard>
					<RoleGuard allow={["super_admin", "security_admin"]}>
						<ConfirmDialog
							trigger={
								<span className="cursor-pointer text-xs text-danger">
									{t("passkeys.revoke")}
								</span>
							}
							title={t("passkeys.revoke")}
							danger
							confirmText={t("passkeys.revoke")}
							onConfirm={() => revoke(row.original.id)}
						/>
					</RoleGuard>
				</div>
			),
		},
	];

	const table = useReactTable({
		data: passkeys,
		columns,
		getCoreRowModel: getCoreRowModel(),
	});

	return (
		<div>
			<DataTable
				table={table}
				emptyLabel={isFetching ? t("common.loading") : t("passkeys.empty")}
			/>
			{/* Rename dialog */}
			{renameId && (
				<Dialog open={!!renameId} onOpenChange={(o) => !o && setRenameId(null)}>
					<DialogContent>
						<DialogHeader>
							<DialogTitle>{t("common.edit")}</DialogTitle>
						</DialogHeader>
						<Input
							value={renameValue}
							onChange={(e) => setRenameValue(e.target.value)}
							placeholder={t("passkeys.col.name")}
						/>
						<DialogFooter>
							<Button variant="secondary" size="sm" onClick={() => setRenameId(null)}>
								{t("common.cancel")}
							</Button>
							<Button variant="primary" size="sm" onClick={doRename}>
								{t("common.save")}
							</Button>
						</DialogFooter>
					</DialogContent>
				</Dialog>
			)}
		</div>
	);
}
