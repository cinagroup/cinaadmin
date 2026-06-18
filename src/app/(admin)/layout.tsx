import { Sidebar } from "@/components/layout/sidebar";
import { Topbar } from "@/components/layout/topbar";
import { ImpersonateBanner } from "@/components/layout/impersonate-banner";

/**
 * Protected console shell. The edge middleware guarantees only
 * super_admin / security_admin reach this layout.
 */
export default function AdminLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	return (
		<div className="flex h-screen">
			<Sidebar />
			<div className="flex flex-1 flex-col">
				<Topbar />
				<ImpersonateBanner />
				<main className="flex-1 overflow-auto p-6">{children}</main>
			</div>
		</div>
	);
}
