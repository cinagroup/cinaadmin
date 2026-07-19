"use client";

import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
	getCoreRowModel,
	useReactTable,
	type ColumnDef,
} from "@tanstack/react-table";
import { DataTable } from "@/components/data-table/data-table";
import { RoleGuard } from "@/components/role-guard";
import { ConfirmDialog } from "@/components/confirm-dialog";
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

	const { data, isFetching } = useQuery({
		queryKey: ["user", userId, "passkeys"],
		queryFn: async () => {
			const r = await fetch(`/api/admin/users/${userId}/passkeys`);
			const d = (await r.json()) as {
				ok: boolean;
				data?: { passkeys?: PasskeyDTO[] };
			};
			return d.ok ? d.data?.passkeys ?? [] : [];
		},
	});

	const passkeys = data ?? [];

	const revoke = async (id: string) => {
		await fetch(`/api/admin/users/${userId}/passkeys/${id}`, {
			method: "DELETE",
		});
		await qc.invalidateQueries({ queryKey: ["user", userId, "passkeys"] });
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
			),
		},
	];

	const table = useReactTable({
		data: passkeys,
		columns,
		getCoreRowModel: getCoreRowModel(),
	});

	return (
		<DataTable
			table={table}
			emptyLabel={isFetching ? t("common.loading") : t("passkeys.empty")}
		/>
	);
}
