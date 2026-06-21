"use client";

import { RoleGuard } from "@/components/role-guard";
import { ConfirmDialog } from "@/components/confirm-dialog";
import { BanDialog } from "./ban-dialog";

/** Role-gated action buttons for a user (ban/delete). */
export function UserActions({
	userId,
	banned,
}: {
	userId: string;
	banned: boolean;
}) {
	const remove = async () => {
		await fetch(`/api/admin/users/${userId}`, { method: "DELETE" });
		window.location.href = "/users";
	};

	return (
		<div className="flex items-center gap-4 text-sm">
			<RoleGuard allow={["super_admin", "security_admin"]}>
				{banned ? (
					<button
						type="button"
						className="text-gold-400"
						onClick={async () => {
							await fetch(`/api/admin/users/${userId}/unban`, {
								method: "POST",
							});
							window.location.reload();
						}}
					>
						解封
					</button>
				) : (
					<BanDialog userId={userId} />
				)}
			</RoleGuard>
			<RoleGuard allow={["super_admin"]}>
				<ConfirmDialog
					trigger={<span className="cursor-pointer text-gold-400">模拟登录</span>}
					title="模拟登录"
					description="将以该用户身份操作，所有操作审计留痕。"
					confirmText="开始模拟"
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
						<span className="cursor-pointer text-danger">删除</span>
					}
					title="删除用户"
					description="此操作不可撤销，用户及其会话将被永久删除。"
					danger
					confirmText="永久删除"
					onConfirm={remove}
				/>
			</RoleGuard>
		</div>
	);
}
