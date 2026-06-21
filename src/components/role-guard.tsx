"use client";

import { useAdminSession } from "@/hooks/use-admin-session";

/** Render children only when the session role is on `allow`. */
export function RoleGuard({
	allow,
	children,
	fallback = null,
}: {
	allow: string[];
	children: React.ReactNode;
	fallback?: React.ReactNode;
}) {
	const { data: session } = useAdminSession();
	if (!session || !allow.includes(session.role)) return <>{fallback}</>;
	return <>{children}</>;
}
