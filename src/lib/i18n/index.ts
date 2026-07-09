"use client";

import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import en from "./locales/en.json";
import zh from "./locales/zh.json";

if (!i18n.isInitialized) {
	// Synchronous init (no LanguageDetector) so SSR + first client render
	// resolve keys immediately — otherwise the server renders raw keys like
	// "nav.overview" and hydration can't reliably fix them on the edge runtime.
	// The console is Chinese-first; users can switch via the topbar selector.
	void i18n.use(initReactI18next).init({
		resources: {
			en: { translation: en },
			zh: { translation: zh },
		},
		lng: "zh",
		fallbackLng: "zh",
		interpolation: { escapeValue: false },
		// Return the key itself (not empty string) when missing, so gaps are
		// visible in dev rather than silently empty.
		parseMissingKeyHandler: (key) => key,
		returnEmptyString: false,
	});
}

export default i18n;
