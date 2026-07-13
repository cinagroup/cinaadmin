"use client";

import { PageHeader } from "@/components/layout/page-header";
import { useI18n } from "@/lib/i18n/i18n-context";

/**
 * API Documentation page — embeds cinaauth's OpenAPI reference (Scalar UI)
 * served at /api/auth/reference on the auth worker.
 *
 * The OpenAPI plugin generates a complete API schema from the loaded
 * plugins, so this page always reflects the current endpoint set.
 */
export default function ApiDocsPage() {
	const { t } = useI18n();
	const cinaauthUrl = process.env.NEXT_PUBLIC_CINAUTH_BASE_URL ?? "https://auth.cinagroup.com";

	return (
		<div className="flex h-full flex-col">
			<PageHeader title={t("apiDocs.title")} />
			<div className="flex-1 overflow-hidden rounded-[var(--radius-lg)] border border-hairline bg-canvas shadow-card">
				<iframe
					src={`${cinaauthUrl}/api/auth/reference`}
					className="h-[calc(100vh-200px)] w-full"
					title="CinaAuth API Reference"
				/>
			</div>
		</div>
	);
}
