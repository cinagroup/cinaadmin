"use client";

import { useTranslation } from "react-i18next";

export default function ForbiddenPage() {
	const { t } = useTranslation();
	return (
		<div className="flex min-h-screen flex-col items-center justify-center gap-2">
			<h1 className="font-serif text-2xl text-gold-500">
				{t("error.403.title")}
			</h1>
			<p className="text-muted">{t("error.403.message")}</p>
		</div>
	);
}
