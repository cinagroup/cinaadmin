"use client";

import { useTranslation } from "react-i18next";

export default function ForbiddenPage() {
	const { t } = useTranslation();
	return (
		<div className="flex min-h-screen flex-col items-center justify-center gap-2 bg-canvas-soft">
			<h1 className="text-[24px] font-semibold leading-8 tracking-[-0.96px] text-ink">
				{t("error.403.title")}
			</h1>
			<p className="text-[16px] leading-6 text-body">
				{t("error.403.message")}
			</p>
		</div>
	);
}
