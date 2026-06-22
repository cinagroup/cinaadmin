import type { ReactNode } from "react";

/**
 * Page title + right-aligned action slot. Sentence-case display-md headline
 * (DESIGN.md typography). Replaces the per-page `font-serif text-xl
 * text-gold-500` heading pattern with a single consistent component.
 */
export function PageHeader({
	title,
	children,
}: {
	title: string;
	children?: ReactNode;
}) {
	return (
		<div className="mb-6 flex items-center justify-between gap-4">
			<h1 className="text-[24px] font-semibold leading-8 tracking-[-0.96px] text-ink">
				{title}
			</h1>
			{children && <div className="flex items-center gap-2">{children}</div>}
		</div>
	);
}
