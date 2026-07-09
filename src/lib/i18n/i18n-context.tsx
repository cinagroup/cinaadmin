"use client";

import { createContext, useContext, useMemo, useState, type ReactNode } from "react";
import { DEFAULT_LANG, translate, type Lang } from "./dictionary";

interface I18nCtx {
	lang: Lang;
	setLang: (l: Lang) => void;
	t: (key: string, vars?: Record<string, string | number>) => string;
}

const Ctx = createContext<I18nCtx>({
	lang: DEFAULT_LANG,
	setLang: () => {},
	t: (key) => key,
});

/**
 * Provides the active language + a synchronous `t()` to the whole shell.
 *
 * NOTE on SSR: React Context does not reliably cross the RSC serialization
 * boundary for `"use client"` providers on the edge runtime, so as a
 * belt-and-braces fallback we also keep a module-level default language and
 * the `t()` below reads from it when no provider value is present.
 */
export function I18nProvider({ children }: { children: ReactNode }) {
	const [lang, setLang] = useState<Lang>(DEFAULT_LANG);
	const value = useMemo<I18nCtx>(
		() => ({
			lang,
			setLang,
			t: (key: string, vars?: Record<string, string | number>) =>
				translate(lang, key, vars),
		}),
		[lang],
	);
	return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

/** Hook: `const { t, lang, setLang } = useI18n()`. Synchronous — SSR-safe. */
export function useI18n(): I18nCtx {
	const ctx = useContext(Ctx);
	// Fallback: resolve against the default dictionary directly so SSR
	// (where the provider value may not propagate) still translates keys
	// instead of returning them raw.
	return {
		...ctx,
		t: (key: string, vars?: Record<string, string | number>) =>
			translate(ctx.lang ?? DEFAULT_LANG, key, vars),
	};
}
