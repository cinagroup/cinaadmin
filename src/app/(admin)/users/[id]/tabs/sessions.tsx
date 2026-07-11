"use client";

import { useQuery } from "@tanstack/react-query";
import {
	getCoreRowModel,
	useReactTable,
	type ColumnDef,
} from "@tanstack/react-table";
import { DataTable } from "@/components/data-table/data-table";
import { ConfirmDialog } from "@/components/confirm-dialog";
import { RoleGuard } from "@/components/role-guard";
import { toast } from "sonner";
import { useI18n } from "@/lib/i18n/i18n-context";
import type { SessionDTO } from "@/lib/cinaauth/dto";

export function SessionsTab({ userId }: { userId: string }) {
	const { t } = useI18n();
	const { data, isFetching, refetch } = useQuery({
		queryKey: ["user", userId, "sessions"],
		queryFn: async () => {
			const r = await fetch(`/api/admin/users/${userId}/sessions`);
			const d = (await r.json()) as {
				ok: boolean;
				data?: { sessions: SessionDTO[] };
			};
			return d.ok ? d.data?.sessions ?? [] : [];
		},
	});

	const sessions = data ?? [];

	const revokeAll = async () => {
		await fetch("/api/admin/sessions/revoke", {
			method: "POST",
			headers: { "content-type": "application/json" },
			body: JSON.stringify({ userId }),
		});
		toast.success(t("toast.sessionsRevoked"));
		await refetch();
	};

	const columns: ColumnDef<SessionDTO>[] = [
		{
			accessorKey: "createdAt",
			header: t("userSessions.col.createdAt"),
			cell: ({ row }) => new Date(row.original.createdAt).toLocaleString(),
		},
		{
			accessorKey: "expiresAt",
			header: t("userSessions.col.expiresAt"),
			cell: ({ row }) => new Date(row.original.expiresAt).toLocaleString(),
		},
		{ accessorKey: "ipAddress", header: t("userSessions.col.ip") },
		{ accessorKey: "userAgent", header: t("userSessions.col.device") },
	];

	const table = useReactTable({
		data: sessions,
		columns,
		getCoreRowModel: getCoreRowModel(),
	});

	return (
		<div>
			<div className="mb-4 flex justify-end">
				<RoleGuard allow={["super_admin", "security_admin"]}>
					<ConfirmDialog
						trigger={
							<span className="cursor-pointer text-sm text-danger">
								{t("userSessions.revokeAll")}
							</span>
						}
						title={t("userSessions.revokeAll")}
						description={t("userDetail.sessions.revokeConfirm")}
						danger
						confirmText={t("userSessions.revokeAllBtn")}
						onConfirm={revokeAll}
					/>
				</RoleGuard>
			</div>
			<DataTable
				table={table}
				emptyLabel={isFetching ? t("common.loading") : t("userSessions.empty")}
			/>
		</div>
	);
}
