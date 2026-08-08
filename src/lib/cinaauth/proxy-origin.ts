/** Only allow browser mutations submitted by the configured admin origin. */
export function isAllowedProxyOrigin(
	requestOrigin: string | null,
	expectedOrigin: string,
): boolean {
	return requestOrigin === expectedOrigin;
}
