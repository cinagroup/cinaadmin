"use client";

import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { useAdminSession } from "@/hooks/use-admin-session";
import type { UserDTO } from "@/lib/cinaauth/dto";

/**
 * User profile overview: read-only details + an editable form (name / email /
 * role) PATCHed to /api/admin/users/[id]. Email + role edits are gated to
 * super_admin at the API layer; the form hides those fields for
 * security_admin.
 */
export function OverviewTab({ user }: { user: UserDTO }) {
	const qc = useQueryClient();
	const { data: session } = useAdminSession();
	const isSuperAdmin = session?.role === "super_admin";

	const [name, setName] = useState(user.name ?? "");
	const [email, setEmail] = useState(user.email);
	const [role, setRole] = useState(user.role);
	const [saving, setSaving] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const [saved, setSaved] = useState(false);

	const save = async (e: React.FormEvent) => {
		e.preventDefault();
		setSaving(true);
		setError(null);
		setSaved(false);
		const body: Record<string, string> = {};
		if (name !== (user.name ?? "")) body.name = name;
		if (isSuperAdmin && email !== user.email) body.email = email;
		if (isSuperAdmin && role !== user.role) body.role = role;
		if (Object.keys(body).length === 0) {
			setSaving(false);
			return;
		}
		const r = await fetch(`/api/admin/users/${user.id}`, {
			method: "PATCH",
			headers: { "content-type": "application/json" },
			body: JSON.stringify(body),
		});
		setSaving(false);
		if (r.ok) {
			setSaved(true);
			await qc.invalidateQueries({ queryKey: ["users"] });
		} else {
			const d = (await r.json().catch(() => null)) as {
				error?: { message?: string };
			} | null;
			setError(d?.error?.message ?? "保存失败");
		}
	};

	return (
		<div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
			{/* Read-only details */}
			<Card>
				<CardHeader>
					<div className="text-[14px] leading-5 text-body">资料详情</div>
				</CardHeader>
				<CardContent>
					<dl className="grid grid-cols-[auto_1fr] gap-x-6 gap-y-3 text-[14px] leading-5">
						<dt className="whitespace-nowrap text-mute">邮箱</dt>
						<dd className="break-all text-ink">{user.email}</dd>
						<dt className="whitespace-nowrap text-mute">用户名</dt>
						<dd className="text-ink">{user.name || "—"}</dd>
						<dt className="whitespace-nowrap text-mute">角色</dt>
						<dd>
							<Badge variant="outline">{user.role}</Badge>
						</dd>
						<dt className="whitespace-nowrap text-mute">2FA</dt>
						<dd>
							{user.twoFactorEnabled ? (
								<Badge variant="success">已开启</Badge>
							) : (
								<Badge variant="warning">未开启</Badge>
							)}
						</dd>
						<dt className="whitespace-nowrap text-mute">邮箱验证</dt>
						<dd>
							{user.emailVerified ? (
								<Badge variant="success">已验证</Badge>
							) : (
								<Badge variant="muted">未验证</Badge>
							)}
						</dd>
						<dt className="whitespace-nowrap text-mute">封禁</dt>
						<dd>
							{user.banned ? (
								<Badge variant="danger">{user.banReason ?? "已封禁"}</Badge>
							) : (
								<Badge variant="success">正常</Badge>
							)}
						</dd>
						<dt className="whitespace-nowrap text-mute">注册时间</dt>
						<dd className="text-ink">
							{new Date(user.createdAt).toLocaleString()}
						</dd>
						<dt className="whitespace-nowrap text-mute">用户 ID</dt>
						<dd className="break-all font-mono text-[12px] leading-4 text-mute">
							{user.id}
						</dd>
					</dl>
				</CardContent>
			</Card>

			{/* Edit form */}
			<Card>
				<CardHeader>
					<div className="text-[14px] leading-5 text-body">编辑资料</div>
				</CardHeader>
				<CardContent>
					<form onSubmit={save} className="space-y-4">
						<div className="space-y-1.5">
							<Label htmlFor="name">用户名</Label>
							<Input
								id="name"
								value={name}
								onChange={(e) => setName(e.target.value)}
							/>
						</div>
						{isSuperAdmin && (
							<div className="space-y-1.5">
								<Label htmlFor="email">邮箱</Label>
								<Input
									id="email"
									type="email"
									value={email}
									onChange={(e) => setEmail(e.target.value)}
								/>
							</div>
						)}
						{isSuperAdmin && (
							<div className="space-y-1.5">
								<Label>角色</Label>
								<Select value={role} onValueChange={setRole}>
									<SelectTrigger className="h-10">
										<SelectValue />
									</SelectTrigger>
									<SelectContent>
										<SelectItem value="user">user</SelectItem>
										<SelectItem value="security_admin">
											security_admin
										</SelectItem>
										<SelectItem value="super_admin">super_admin</SelectItem>
									</SelectContent>
								</Select>
							</div>
						)}
						{!isSuperAdmin && (
							<p className="text-[12px] leading-4 text-mute">
								邮箱与角色修改需 super_admin 权限。
							</p>
						)}
						{error && (
							<div className="text-[14px] leading-5 text-error">{error}</div>
						)}
						{saved && (
							<div className="text-[14px] leading-5 text-success">
								已保存
							</div>
						)}
						<Button type="submit" disabled={saving}>
							{saving ? "保存中…" : "保存"}
						</Button>
					</form>
				</CardContent>
			</Card>
		</div>
	);
}
