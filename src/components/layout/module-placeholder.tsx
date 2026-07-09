"use client";

import { useI18n } from "@/lib/i18n/i18n-context";

/**
 * Placeholder for a Phase 2/3 module page. Reused for the 7 nav routes until
 * their real implementations land.
 */
export function ModulePlaceholder({ label }: { label: string }) {
	const { t } = useI18n();
	return (
		<div>
			<h1 className="text-[24px] font-semibold leading-8 tracking-[-0.96px] text-ink">
				{label}
			</h1>
			<p className="mt-2 text-[14px] leading-5 text-body">
				{t("placeholder.phase2")}
			</p>
		</div>
	);
}
