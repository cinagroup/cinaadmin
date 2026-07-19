"use client";

export const runtime = "edge";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
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
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
	Dialog,
	DialogContent,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { PageHeader } from "@/components/layout/page-header";
import { useI18n } from "@/lib/i18n/i18n-context";
import { InviteDialog } from "./invite-dialog";

interface MemberDTO {
	id: string;
	userId: string;
	role: string;
	createdAt: string;
	user?: { name?: string; email?: string; image?: string | null };
}

export default function OrganizationDetailPage() {
	const { t } = useI18n();
	const params = useParams<{ id: string }>();
	const orgId = params.id;
	const qc = useQueryClient();
	const router = useRouter();
	const [editOpen, setEditOpen] = useState(false);
	const [editName, setEditName] = useState("");
	const [editSlug, setEditSlug] = useState("");

	const { data: org, isFetching } = useQuery({
		queryKey: ["organization", orgId],
		queryFn: async () => {
			const r = await fetch(`/api/admin/organizations/${orgId}`);
			const d = await r.json();
			return d.ok ? d.data : null;
		},
	});

	const { data: membersData } = useQuery({
		queryKey: ["organization-members", orgId],
		queryFn: async () => {
			const r = await fetch(`/api/admin/organizations/${orgId}/members`);
			const d = await r.json();
			return d.ok ? (d.data?.members ?? []) : [];
		},
	});

	const members: MemberDTO[] = membersData ?? [];

	const removeMember = async (memberId: string) => {
		await fetch(`/api/admin/organizations/${orgId}/members/${memberId}`, {
			method: "DELETE",
		});
		await qc.invalidateQueries({ queryKey: ["organization-members", orgId] });
	};

	const changeRole = async (memberId: string, role: string) => {
		const r = await fetch(`/api/admin/organizations/${orgId}/members/${memberId}/role`, {
			method: "POST",
			headers: { "content-type": "application/json" },
			body: JSON.stringify({ role }),
		});
		if (r.ok) {
			toast.success(t("toast.roleChanged"));
			await qc.invalidateQueries({ queryKey: ["organization-members", orgId] });
		}
	};

	const saveOrg = async () => {
		const r = await fetch(`/api/admin/organizations/${orgId}/update`, {
			method: "POST",
			headers: { "content-type": "application/json" },
			body: JSON.stringify({ name: editName, slug: editSlug }),
		});
		if (r.ok) {
			toast.success(t("toast.orgUpdated"));
			setEditOpen(false);
			await qc.invalidateQueries({ queryKey: ["organization", orgId] });
		}
	};

	const deleteOrg = async () => {
		const r = await fetch(`/api/admin/organizations/${orgId}/delete`, {
			method: "POST",
		});
		if (r.ok) {
			toast.success(t("toast.orgDeleted"));
			router.push("/organizations");
		}
	};

	const memberColumns: ColumnDef<MemberDTO>[] = [
		{
			accessorKey: "user.email",
			header: "Email",
			cell: ({ row }) => (
				<span className="font-medium text-ink">
					{row.original.user?.email ?? row.original.userId}
				</span>
			),
		},
		{
			accessorKey: "user.name",
			header: "Name",
			cell: ({ row }) => row.original.user?.name ?? "—",
		},
		{
			accessorKey: "role",
			header: "Role",
			cell: ({ row }) => {
				const role = row.original.role;
				if (role === "owner") {
					return <Badge variant="success">{role}</Badge>;
				}
				return (
					<RoleGuard allow={["super_admin"]} fallback={<Badge>{role}</Badge>}>
						<Select
							value={role}
							onValueChange={(v) => changeRole(row.original.id, v)}
						>
							<SelectTrigger className="h-7 w-[110px] text-[13px]">
								<SelectValue />
							</SelectTrigger>
							<SelectContent>
								<SelectItem value="admin">admin</SelectItem>
								<SelectItem value="member">member</SelectItem>
							</SelectContent>
						</Select>
					</RoleGuard>
				);
			},
		},
		{
			id: "actions",
			header: "",
			cell: ({ row }) => (
				<RoleGuard allow={["super_admin"]}>
					{row.original.role !== "owner" && (
						<ConfirmDialog
							trigger={
								<Button variant="ghost" size="sm" className="text-danger">
									{t("common.remove")}
								</Button>
							}
							title={t("organizations.removeMember")}
							onConfirm={() => removeMember(row.original.id)}
						/>
					)}
				</RoleGuard>
			),
		},
	];

	const table = useReactTable({
		data: members,
		columns: memberColumns,
		getCoreRowModel: getCoreRowModel(),
	});

	return (
		<div>
			<PageHeader title={org?.name ?? t("common.loading")} backHref="/organizations" backLabel={t("nav.organizations")}>
				<RoleGuard allow={["super_admin"]}>
					<InviteDialog orgId={orgId} />
					<Button
						variant="secondary"
						size="sm"
						onClick={() => {
							setEditName(org?.name ?? "");
							setEditSlug(org?.slug ?? "");
							setEditOpen(true);
						}}
					>
						{t("organizations.editOrg")}
					</Button>
					<ConfirmDialog
						trigger={<Button variant="danger" size="sm">{t("organizations.deleteOrg")}</Button>}
						title={t("organizations.deleteOrg")}
						description={t("organizations.deleteConfirm")}
						danger
						confirmText={t("common.delete")}
						onConfirm={deleteOrg}
					/>
				</RoleGuard>
			</PageHeader>
			<div className="mb-4 flex items-center gap-4 text-sm text-ink-light">
				<span>Slug: {org?.slug ?? "—"}</span>
				<span>Members: {members.length}</span>
			</div>
			<DataTable
				table={table}
				emptyLabel={
					isFetching ? t("common.loading") : t("organizations.noMembers")
				}
			/>

			{/* Pending invitations */}
			{org?.invitations && org.invitations.length > 0 && (
				<div className="mt-6">
					<h3 className="mb-3 font-mono text-[12px] uppercase tracking-wide text-mute">
						{t("organizations.invitations")} ({org.invitations.length})
					</h3>
					<div className="space-y-2">
						{org.invitations.map((inv: Record<string, unknown>) => (
							<div key={String(inv.id)} className="flex items-center justify-between rounded-[var(--radius-sm)] border border-hairline bg-canvas px-4 py-2">
								<div className="flex items-center gap-3 text-[14px]">
									<span className="font-medium text-ink">{String(inv.email ?? "—")}</span>
									<Badge variant="muted">{String(inv.role ?? "member")}</Badge>
									<span className="text-mute">{String(inv.status ?? "pending")}</span>
								</div>
								<RoleGuard allow={["super_admin"]}>
									<ConfirmDialog
										trigger={
											<Button variant="ghost" size="sm" className="text-danger">
												{t("organizations.cancelInvite")}
											</Button>
										}
										title={t("organizations.cancelInvite")}
										onConfirm={async () => {
											await fetch(`/api/admin/organizations/${orgId}/invitations/${inv.id}`, {
												method: "DELETE",
											});
											toast.success(t("organizations.cancelInvite"));
											await qc.invalidateQueries({ queryKey: ["organization", orgId] });
										}}
									/>
								</RoleGuard>
							</div>
						))}
					</div>
				</div>
			)}

				{/* Edit organization dialog */}
			<Dialog open={editOpen} onOpenChange={setEditOpen}>
				<DialogContent>
					<DialogHeader>
						<DialogTitle>{t("organizations.editOrg")}</DialogTitle>
					</DialogHeader>
					<div className="space-y-4">
						<div className="space-y-1.5">
							<Label htmlFor="org-name">{t("organizations.orgName")}</Label>
							<Input
								id="org-name"
								value={editName}
								onChange={(e) => setEditName(e.target.value)}
							/>
						</div>
						<div className="space-y-1.5">
							<Label htmlFor="org-slug">{t("organizations.slug")}</Label>
							<Input
								id="org-slug"
								value={editSlug}
								onChange={(e) => setEditSlug(e.target.value)}
							/>
						</div>
					</div>
					<DialogFooter>
						<Button variant="secondary" size="sm" onClick={() => setEditOpen(false)}>
							{t("common.cancel")}
						</Button>
						<Button variant="primary" size="sm" onClick={saveOrg}>
							{t("organizations.save")}
						</Button>
					</DialogFooter>
				</DialogContent>
			</Dialog>
		</div>
	);
}
