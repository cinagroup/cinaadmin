"use client";

import { useTranslation } from "react-i18next";
import { ModulePlaceholder } from "@/components/layout/module-placeholder";

export default function DashboardPage() {
	const { t } = useTranslation();
	return <ModulePlaceholder label={t("nav.overview")} />;
}
