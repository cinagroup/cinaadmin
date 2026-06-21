/** Compact status/result badge. `variant` maps to the black-gold theme. */
export function Badge({
	variant = "default",
	children,
}: {
	variant?: "default" | "danger" | "gold" | "muted";
	children: React.ReactNode;
}) {
	const styles: Record<string, string> = {
		default: "bg-ink-800 text-text",
		danger: "border-danger/30 bg-danger/15 text-danger",
		gold: "border-gold-500/30 bg-gold-500/15 text-gold-400",
		muted: "bg-ink-800 text-muted",
	};
	return (
		<span
			className={`inline-flex items-center rounded border px-2 py-0.5 text-xs ${styles[variant]}`}
		>
			{children}
		</span>
	);
}
