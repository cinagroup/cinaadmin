export type AdminRole = "super_admin" | "security_admin" | "admin" | "user" | (string & {});

export interface AdminSession {
	userId: string;
	role: AdminRole;
	email?: string;
	name?: string;
	/** Non-null when the admin is currently impersonating this user. */
	impersonatedBy?: string | null;
}

export interface StandardResponse<T> {
	ok: boolean;
	data?: T;
	error?: { code: string; message: string };
}
