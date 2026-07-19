"use client";

import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { ConfirmDialog } from "@/components/confirm-dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { useI18n } from "@/lib/i18n/i18n-context";

export function InviteDialog({ orgId }: { orgId: string }) {
	const { t } = useI18n();
	const qc = useQueryClient();
	const [email, setEmail] = useState("");
	const [role, setRole] = useState("member");
	const [inviting, setInviting] = useState(false);

	const invite = async () => {
		setInviting(true);
		const r = await fetch(`/api/admin/organizations/${orgId}/invite`, {
			method: "POST",
			headers: { "content-type": "application/json" },
			body: JSON.stringify({ email, role }),
		});
		setInviting(false);
		// A failed invite must not look like a sent one — keep the email and
		// tell the admin, instead of silently clearing the form.
		if (r.ok) {
			setEmail("");
			toast.success(t("toast.inviteSent"));
		} else {
			toast.error(t("toast.actionFailed"));
		}
		await qc.invalidateQueries({ queryKey: ["organization-members", orgId] });
	};

	return (
		<ConfirmDialog
			trigger={<Button variant="primary" size="sm">{t("organizations.invite")}</Button>}
			title={t("organizations.invite")}
			confirmText={inviting ? t("common.inviting") : t("common.send")}
			onConfirm={invite}
		>
			<Input
				type="email"
				value={email}
				onChange={(e) => setEmail(e.target.value)}
				placeholder="user@example.com"
			/>
			<Select value={role} onValueChange={setRole}>
				<SelectTrigger className="h-10">
					<SelectValue />
				</SelectTrigger>
				<SelectContent>
					<SelectItem value="member">Member</SelectItem>
					<SelectItem value="admin">Admin</SelectItem>
				</SelectContent>
			</Select>
		</ConfirmDialog>
	);
}
