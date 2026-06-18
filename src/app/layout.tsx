import type { Metadata } from "next";
import { Inter, Playfair_Display } from "next/font/google";
import "@/lib/i18n";
import "./globals.css";

const inter = Inter({ variable: "--font-sans", subsets: ["latin"] });
const playfair = Playfair_Display({
	variable: "--font-serif",
	subsets: ["latin"],
});

export const metadata: Metadata = {
	title: "CinaGroup Admin",
	description: "CinaGroup user & audit management console",
};

export default function RootLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	return (
		<html lang="en" className={`${inter.variable} ${playfair.variable}`}>
			<body>{children}</body>
		</html>
	);
}
