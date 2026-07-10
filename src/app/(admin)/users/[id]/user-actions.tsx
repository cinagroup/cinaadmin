"use client";

import { RoleGuard } from "@/components/role-guard";
import { ConfirmDialog } from "@/components/confirm-dialog";
import { Button } from "@/components/ui/button";
import { useI18n } from "@/lib/i18n/i18n-context";
import { BanDialog } from "./ban-dialog";

/** Role-gated action buttons for a user (ban/delete). */
export function UserActions({
	userId,
	banned,
}: {
	userId: string;
	banned: boolean;
}) {
	const { t } = useI18n();
	const remove = async () => {
		await fetch(`/api/admin/users/${userId}`, { method: "DELETE" });
		window.location.href = "/users";
	};

	return (
		<div className="flex items-center gap-3">
			<RoleGuard allow={["super_admin", "security_admin"]}>
				{banned ? (
					<Button
						variant="secondary"
						size="sm"
						onClick={async () => {
							await fetch(`/api/admin/users/${userId}/unban`, {
								method: "POST",
							});
							window.location.reload();
						}}
					>
						{t("userDetail.actions.unban")}
					</Button>
				) : (
					<BanDialog userId={userId} />
				)}
			</RoleGuard>
			<RoleGuard allow={["super_admin"]}>
				<ConfirmDialog
					trigger={
						<Button variant="outline" size="sm">
							{t("userDetail.actions.impersonate")}
						</Button>
					}
					title={t("userDetail.actions.impersonate")}
					description={t("userDetail.impersonate.hint")}
					confirmText={t("userDetail.impersonate.start")}
					onConfirm={async () => {
						await fetch(`/api/admin/users/${userId}/impersonate`, {
							method: "POST",
						});
						window.location.reload();
					}}
				/>
			</RoleGuard>
			<RoleGuard allow={["super_admin"]}>
				<ConfirmDialog
					trigger={
						<Button variant="danger" size="sm">
							{t("common.delete")}
						</Button>
					}
					title={t("userDetail.delete.title")}
					description={t("userDetail.delete.confirm")}
					danger
					confirmText={t("userDetail.delete.permanent")}
					onConfirm={remove}
				/>
			</RoleGuard>
		</div>
	);
}
