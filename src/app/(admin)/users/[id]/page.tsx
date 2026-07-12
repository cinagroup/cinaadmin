"use client";

import { use } from "react";
import { useQuery } from "@tanstack/react-query";
import { PageHeader } from "@/components/layout/page-header";
import { Skeleton } from "@/components/ui/skeleton";
import { useI18n } from "@/lib/i18n/i18n-context";
import { UserTabs } from "./user-tabs";
import { UserActions } from "./user-actions";
import type { UserDTO } from "@/lib/cinaauth/dto";

/**
 * User detail page — client component.
 *
 * Was a server component using cookies() + getUser(), but the edge SSR
 * couldn't reliably forward the session cookie to cinaauth (returned "用户不
 * 存在或加载失败"). Now fetches via the /api/admin/users/[id] proxy (GET),
 * which correctly reads the cookie from the request headers — matching the
 * pattern used by all other pages.
 */
export default function UserDetailPage({
	params,
}: {
	params: Promise<{ id: string }>;
}) {
	const { id } = use(params);
	const { t } = useI18n();
	const { data: user, isLoading, isError } = useQuery<UserDTO | null>({
		queryKey: ["user", id],
		queryFn: async () => {
			const r = await fetch(`/api/admin/users/${id}`);
			const d = (await r.json()) as {
				ok?: boolean;
				data?: Record<string, unknown>;
			};
			if (!d.ok || !d.data) return null;
			const u = d.data;
			return {
				id: String(u.id ?? ""),
				email: String(u.email ?? ""),
				name: (u.name as string | null | undefined) ?? null,
				role: String(u.role ?? "user"),
				banned: Boolean(u.banned),
				banReason: (u.banReason as string | null | undefined) ?? null,
				banExpires: (u.banExpires as string | null | undefined) ?? null,
				twoFactorEnabled: Boolean(u.twoFactorEnabled),
				emailVerified: Boolean(u.emailVerified),
				createdAt: String(u.createdAt ?? new Date().toISOString()),
				image: (u.image as string | null | undefined) ?? null,
			} as UserDTO;
		},
	});

	if (isLoading) {
		return (
			<div className="space-y-6">
				<PageHeader title="…" backHref="/users" backLabel={t("users.back")} />
				<div className="space-y-4">
					<Skeleton className="h-10 w-full" />
					<Skeleton className="h-10 w-full" />
					<Skeleton className="h-10 w-full" />
				</div>
			</div>
		);
	}

	if (isError || !user) {
		return (
			<div>
				<PageHeader
					title={t("users.notFound")}
					backHref="/users"
					backLabel={t("users.back")}
				/>
			</div>
		);
	}

	return (
		<div>
			<PageHeader
				title={user.email}
				backHref="/users"
				backLabel={t("users.back")}
			>
				<UserActions
					userId={id}
					banned={user.banned}
					twoFactorEnabled={user.twoFactorEnabled}
				/>
			</PageHeader>
			<UserTabs user={user} />
		</div>
	);
}

// Required by Cloudflare Pages (@cloudflare/next-on-pages).
export const runtime = "edge";
