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

/** Provides the active language + a synchronous `t()` to the whole shell. */
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
	return useContext(Ctx);
}
