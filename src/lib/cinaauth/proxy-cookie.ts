const COOKIE_BOUNDARY = /,(?=\s*[!#$%&'*+\-.^_`|~0-9A-Za-z]+=)/g;

/** Split a merged Set-Cookie header without splitting an Expires date. */
export function splitSetCookieHeader(header: string): string[] {
	return header
		.split(COOKIE_BOUNDARY)
		.map((cookie) => cookie.trim())
		.filter(Boolean);
}

/** Scope an upstream auth cookie to the admin host serving the proxy. */
export function toHostOnlyCookie(cookie: string): string {
	return cookie
		.split(";")
		.filter((attribute) => !/^\s*domain=/i.test(attribute))
		.join(";");
}
