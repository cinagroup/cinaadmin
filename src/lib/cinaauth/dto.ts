/** DTOs for the admin console. UI depends ONLY on these — never on cinaauth's
 *  raw response shapes. Field names mirror what admin-api.ts maps to. */

export interface UserDTO {
	id: string;
	email: string;
	name: string | null;
	role: string;
	banned: boolean;
	banReason: string | null;
	banExpires: string | null;
	twoFactorEnabled: boolean;
	emailVerified: boolean;
	createdAt: string;
	image: string | null;
}

export interface WalletDTO {
	address: string;
	chainId: number;
	isPrimary: boolean;
	boundAt: string;
	boundIp: string | null;
	boundSite: string | null;
}

export interface SessionDTO {
	id: string;
	userId: string;
	createdAt: string;
	expiresAt: string;
	ipAddress: string | null;
	userAgent: string | null;
}

export interface AuditLogDTO {
	id: string;
	timestamp: string;
	category: string;
	action: string;
	result: "success" | "failure";
	actorId: string | null;
	actorRole: string | null;
	actorIp: string | null;
	actorUa: string | null;
	actorSite: string | null;
	targetType: string | null;
	targetId: string | null;
	metadata: Record<string, unknown> | null;
}

export interface StatsOverviewDTO {
	totalUsers: number;
	newUsers30d: number;
	activeSessions: number;
	organizationCount: number;
	bannedCount: number;
	usersWithout2FA: number;
	loginChannels: Record<string, number>;
}

export interface SignupPointDTO {
	date: string;
	count: number;
}

export interface SecurityTodayDTO {
	failedLoginsToday: number;
	otpRequestsToday: number;
	geoAnomalyCount: number;
}

/** Paginated list wrapper returned by admin-api list helpers. */
export interface Page<T> {
	rows: T[];
	total: number;
}

/** Organization record (organization plugin). */
export interface OrgDTO {
	id: string;
	name: string;
	slug: string;
	createdAt: string;
	membersCount?: number;
}

/** API key record (api-key plugin). */
export interface ApiKeyDTO {
	id: string;
	name: string;
	enabled: boolean;
	startsAt: string | null;
	expiresAt: string | null;
	prefix: string;
	lastUsedAt: string | null;
	remaining: number | null;
}
