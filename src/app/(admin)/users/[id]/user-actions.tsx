"use client";

import { useState } from "react";
import { toast } from "sonner";
import { RoleGuard } from "@/components/role-guard";
import { ConfirmDialog } from "@/components/confirm-dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useI18n } from "@/lib/i18n/i18n-context";
import { BanDialog } from "./ban-dialog";

/** Role-gated action buttons for a user (ban/delete/reset-2fa). */
export function UserActions({
	userId,
	banned,
	role,
	twoFactorEnabled,
}: {
	userId: string;
	banned: boolean;
	role: string;
	twoFactorEnabled?: boolean;
}) {
	const { t } = useI18n();
	const [newPassword, setNewPassword] = useState("");

	const resetPassword = async () => {
		const r = await fetch(`/api/admin/users/${userId}/reset-password`, {
			method: "POST",
			headers: { "content-type": "application/json" },
			body: JSON.stringify({ newPassword }),
		});
		if (r.ok) {
			toast.success(t("toast.passwordReset"));
			setNewPassword("");
		} else {
			toast.error(t("toast.saveFailed"));
		}
	};
	const remove = async () => {
		const r = await fetch(`/api/admin/users/${userId}`, { method: "DELETE" });
		if (r.ok) {
			toast.success(t("toast.deleted"));
			window.location.href = "/users";
		} else {
			toast.error(t("toast.deleteFailed"));
		}
	};

	return (
		<div className="flex items-center gap-3">
			<RoleGuard allow={["super_admin", "security_admin"]}>
				{banned ? (
					<Button
						variant="secondary"
						size="sm"
						onClick={async () => {
							const r = await fetch(`/api/admin/users/${userId}/unban`, {
								method: "POST",
							});
							if (r.ok) {
								toast.success(t("toast.unbanned"));
								window.location.reload();
							}
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
							{t("userDetail.actions.resetPassword")}
						</Button>
					}
					title={t("userDetail.resetPassword.title")}
					description={t("userDetail.resetPassword.hint")}
					confirmText={t("userDetail.resetPassword.confirm")}
					onConfirm={resetPassword}
				>
					<div className="space-y-1.5">
						<Label htmlFor="new-password">{t("userDetail.resetPassword.label")}</Label>
						<Input
							id="new-password"
							type="password"
							value={newPassword}
							onChange={(e) => setNewPassword(e.target.value)}
							placeholder={t("userDetail.resetPassword.placeholder")}
						/>
					</div>
				</ConfirmDialog>
			</RoleGuard>
			{twoFactorEnabled && (
				<RoleGuard allow={["super_admin"]}>
					<ConfirmDialog
						trigger={
							<Button variant="outline" size="sm">
								{t("userDetail.actions.reset2fa")}
							</Button>
						}
						title={t("userDetail.actions.reset2fa")}
						description={t("userDetail.reset2fa.hint")}
						danger
						confirmText={t("userDetail.reset2fa.confirm")}
						onConfirm={async () => {
							const r = await fetch(`/api/admin/users/${userId}/reset-2fa`, {
								method: "POST",
							});
							if (r.ok) {
								toast.success(t("toast.reset2fa"));
								window.location.reload();
							} else {
								toast.error(t("toast.saveFailed"));
							}
						}}
					/>
				</RoleGuard>
			)}
			<RoleGuard allow={["super_admin"]}>
				<ConfirmDialog
					trigger={
						<Button
							variant="outline"
							size="sm"
							disabled={role === "super_admin" || role === "security_admin"}
							title={role === "super_admin" || role === "security_admin" ? t("userDetail.actions.impersonateBlocked") : undefined}
						>
							{t("userDetail.actions.impersonate")}
						</Button>
					}
					title={t("userDetail.actions.impersonate")}
					description={t("userDetail.impersonate.hint")}
					confirmText={t("userDetail.impersonate.start")}
					onConfirm={async () => {
						const r = await fetch(`/api/admin/users/${userId}/impersonate`, {
							method: "POST",
						});
						if (r.ok) {
							toast.success(t("toast.impersonating"));
							window.location.reload();
						}
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
