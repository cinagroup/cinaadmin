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
		<div className="flex h-screen bg-canvas-soft">
			<Sidebar />
			<div className="flex flex-1 flex-col">
				<Topbar />
				<ImpersonateBanner />
				<main className="flex-1 overflow-auto">
					<div className="mx-auto w-full max-w-[1400px] px-6 py-8 md:px-8">
						{children}
					</div>
				</main>
			</div>
		</div>
	);
}
