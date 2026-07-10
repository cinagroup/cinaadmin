import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import type { ReactNode } from "react";

/**
 * Unified page header — the single title bar every admin page uses.
 *
 * - `title`: the display-scale headline (24/600/-0.96px).
 * - `description`: optional context subtitle (e.g. "数据快照 · Jul 10").
 * - `backHref`: optional back-link rendered above the title (detail pages).
 * - `children`: right-aligned action slot (buttons, selects).
 *
 * Replaces the hand-rolled headers previously inlined in the dashboard
 * and user-detail pages, so every page shares one consistent header voice.
 */
export function PageHeader({
	title,
	description,
	backHref,
	backLabel,
	children,
}: {
	title: string;
	description?: string;
	backHref?: string;
	backLabel?: string;
	children?: ReactNode;
}) {
	return (
		<div className="mb-6">
			{backHref && (
				<Link
					href={backHref}
					className="mb-3 inline-flex items-center gap-1 text-[13px] leading-4 text-body transition-colors hover:text-ink"
				>
					<ArrowLeft size={14} />
					{backLabel ?? "Back"}
				</Link>
			)}
			<div className="flex items-end justify-between gap-4">
				<div>
					<h1 className="text-[24px] font-semibold leading-8 tracking-[-0.96px] text-ink">
						{title}
					</h1>
					{description && (
						<p className="mt-1 text-[14px] leading-5 text-body">{description}</p>
					)}
				</div>
				{children && <div className="flex shrink-0 items-center gap-2">{children}</div>}
			</div>
		</div>
	);
}
