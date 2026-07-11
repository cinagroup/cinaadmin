import { chromium, type Page, type ConsoleMessage } from "@playwright/test";

/**
 * Browser E2E test for admin.cinagroup.com.
 *
 * Run: npx tsx e2e/admin.spec.ts
 *
 * Tests:
 * 1. Login flow (demo-auth → admin console)
 * 2. Sidebar navigation (all pages load, no console errors)
 * 3. Users table row click → detail page
 * 4. Toast feedback on profile save
 * 5. EN/ZH language switch
 * 6. Dark/light theme switch
 * 7. Console error capture (no React errors, no 502s)
 */

const BASE = "https://admin.cinagroup.com";
const AUTH_BASE = "https://auth.cinagroup.com";
const AUTH_FRONTEND = "https://demo-auth.cinagroup.com";
const EMAIL = "admin@cinagroup.com";
const PASSWORD = "CinaAdmin-2026!";

interface TestResult {
	name: string;
	pass: boolean;
	detail: string;
}

const results: TestResult[] = [];
const consoleErrors: ConsoleMessage[] = [];
const networkErrors: string[] = [];

function log(name: string, pass: boolean, detail: string) {
	const mark = pass ? "✓" : "✗";
	results.push({ name, pass, detail });
	console.log(`  ${mark} ${name}${detail ? ": " + detail : ""}`);
}

async function run() {
	console.log("\n═══════════════════════════════════════════════");
	console.log("  cinaadmin Browser E2E Test");
	console.log("═══════════════════════════════════════════════\n");

	const browser = await chromium.launch({ headless: true });
	const context = await browser.newContext({
		viewport: { width: 1440, height: 900 },
		locale: "zh-CN",
	});
	const page = await context.newPage();

	// Capture console errors and network failures
	page.on("console", (msg) => {
		if (msg.type() === "error") {
			consoleErrors.push(msg);
		}
	});
	page.on("requestfailed", (req) => {
		networkErrors.push(`${req.method()} ${req.url()} - ${req.failure()?.errorText}`);
	});

	try {
		// ── 1. Login flow ──
		console.log("【1. 登录流程】");
		await page.goto(`${BASE}/dashboard`, { waitUntil: "networkidle", timeout: 30000 });
		// Should redirect to demo-auth login
		await page.waitForURL(/demo-auth\.cinagroup\.com\/sign-in/, { timeout: 15000 });
		log("未登录重定向到登录页", true, page.url());

		// Click "Continue with Password"
		const pwdLink = page.getByRole("link", { name: /password|密码/i }).first();
		if (await pwdLink.isVisible({ timeout: 5000 }).catch(() => false)) {
			await pwdLink.click();
			await page.waitForURL(/sign-in\/password/, { timeout: 10000 });
		}

		// Fill login form
		await page.fill('input[type="email"], input[id*="email"]', EMAIL);
		await page.fill('input[type="password"], input[id*="password"]', PASSWORD);
		await page.click('button[type="submit"]');
		// Wait for redirect back to admin
		await page.waitForURL(/admin\.cinagroup\.com/, { timeout: 20000 });
		log("登录成功，跳转到 admin", true, page.url());

		// ── 2. Sidebar navigation ──
		console.log("\n【2. 侧边栏导航】");
		const navPages = [
			{ href: "/dashboard", label: /总览|Overview/ },
			{ href: "/users", label: /用户|Users/ },
			{ href: "/sessions", label: /会话|Sessions/ },
			{ href: "/organizations", label: /组织|Organizations/ },
			{ href: "/api-keys", label: /API/ },
			{ href: "/audit", label: /审计|Audit/ },
			{ href: "/settings/security", label: /安全|Security/ },
		];

		for (const nav of navPages) {
			const navLink = page.locator(`a[href="${nav.href}"]`).first();
			if (await navLink.isVisible({ timeout: 3000 }).catch(() => false)) {
				await navLink.click();
				await page.waitForLoadState("networkidle", { timeout: 15000 });
				const url = page.url();
				const isCorrect = url.includes(nav.href);
				log(`导航到 ${nav.href}`, isCorrect, url);
			} else {
				log(`导航到 ${nav.href}`, false, "侧边栏链接不可见");
			}
		}

		// ── 3. Users table row click ──
		console.log("\n【3. 用户列表行点击】");
		await page.goto(`${BASE}/users`, { waitUntil: "networkidle", timeout: 15000 });
		await page.waitForTimeout(2000); // wait for client data load
		const tableRows = page.locator("table tbody tr");
		const rowCount = await tableRows.count();
		if (rowCount > 0) {
			await tableRows.first().click();
			await page.waitForTimeout(2000);
			const isDetail = page.url().includes("/users/") && !page.url().endsWith("/users");
			log("行点击跳转到用户详情", isDetail, page.url());
			// Check detail page loaded data (not "加载失败")
			const bodyText = await page.locator("body").innerText();
			const hasData = !bodyText.includes("加载失败") && !bodyText.includes("not found");
			log("用户详情页数据加载", hasData, hasData ? "有数据" : "显示加载失败");
		} else {
			log("行点击跳转到用户详情", false, "表格无数据行");
		}

		// ── 4. Toast feedback ──
		console.log("\n【4. Toast 反馈】");
		// Navigate to user detail, try saving profile
		const userId = page.url().split("/users/")[1]?.split("?")[0];
		if (userId) {
			// Look for a save button in the overview tab
			const saveBtn = page.locator('button[type="submit"]').first();
			if (await saveBtn.isVisible({ timeout: 3000 }).catch(() => false)) {
				await saveBtn.click();
				await page.waitForTimeout(1500);
				const toastVisible = await page.locator('[data-sonner-toast]').count();
				log("Toast 反馈显示", toastVisible > 0, toastVisible > 0 ? "toast 出现" : "无 toast");
			} else {
				log("Toast 反馈显示", false, "无保存按钮");
			}
		}

		// ── 5. EN/ZH language switch ──
		console.log("\n【5. 多语言切换】");
		await page.goto(`${BASE}/dashboard`, { waitUntil: "networkidle", timeout: 15000 });
		// Find the language select trigger
		const langSelect = page.locator('button[role="combobox"]').filter({ hasText: /中文|EN/ }).first();
		if (await langSelect.isVisible({ timeout: 5000 }).catch(() => false)) {
			// Get current sidebar text
			const zhText = await page.locator("nav").innerText();
			await langSelect.click();
			await page.waitForTimeout(500);
			// Click EN option
			const enOption = page.locator('[role="option"]').filter({ hasText: /^EN$/ }).first();
			if (await enOption.isVisible({ timeout: 2000 }).catch(() => false)) {
				await enOption.click();
				await page.waitForTimeout(1000);
				const enText = await page.locator("nav").innerText();
				const switched = !enText.includes("总览") && enText.includes("Overview");
				log("切换到英文", switched, switched ? "侧边栏变英文" : "未切换");
			} else {
				log("切换到英文", false, "EN 选项不可见");
			}
		} else {
			log("多语言切换", false, "语言选择器不可见");
		}

		// ── 6. Dark/Light theme switch ──
		console.log("\n【6. 暗色/浅色主题切换】");
		const htmlEl = page.locator("html");
		const darkBefore = await htmlEl.evaluate((el) => el.classList.contains("dark"));
		// Find theme toggle button
		const themeBtn = page.locator('button[aria-label*="theme" i], button[aria-label*="Toggle" i]').first();
		if (await themeBtn.isVisible({ timeout: 3000 }).catch(() => false)) {
			await themeBtn.click();
			await page.waitForTimeout(500);
			// Click "浅色" or "Light" option
			const lightOption = page.locator('[role="menuitem"]').filter({ hasText: /浅色|Light/i }).first();
			if (await lightOption.isVisible({ timeout: 2000 }).catch(() => false)) {
				await lightOption.click();
				await page.waitForTimeout(1000);
				const darkAfter = await htmlEl.evaluate((el) => el.classList.contains("dark"));
				log("切换到浅色主题", !darkAfter, darkAfter ? "仍为暗色" : "已切浅色");
			} else {
				log("切换主题", false, "浅色选项不可见");
			}
		} else {
			log("暗色/浅色主题切换", false, "主题按钮不可见");
		}

		// ── 7. Console errors ──
		console.log("\n【7. 控制台错误】");
		log("无 React 控制台错误", consoleErrors.length === 0,
			consoleErrors.length === 0 ? "无错误" : `${consoleErrors.length} 个错误`);
		if (consoleErrors.length > 0) {
			consoleErrors.slice(0, 5).forEach((err) => {
				console.log(`    ⚠ ${err.text().slice(0, 120)}`);
			});
		}
		log("无网络请求失败", networkErrors.length === 0,
			networkErrors.length === 0 ? "无失败" : `${networkErrors.length} 个失败`);
		if (networkErrors.length > 0) {
			networkErrors.slice(0, 5).forEach((err) => {
				console.log(`    ⚠ ${err.slice(0, 120)}`);
			});
		}

	} catch (err) {
		log("测试执行", false, `异常: ${(err as Error).message}`);
	} finally {
		await browser.close();
	}

	// ── Summary ──
	const passed = results.filter((r) => r.pass).length;
	const failed = results.filter((r) => !r.pass).length;
	console.log("\n═══════════════════════════════════════════════");
	console.log(`  结果: ${passed} 通过 / ${failed} 失败 / ${results.length} 总计`);
	console.log("═══════════════════════════════════════════════\n");

	if (failed > 0) {
		console.log("失败项:");
		results.filter((r) => !r.pass).forEach((r) => {
			console.log(`  ✗ ${r.name}: ${r.detail}`);
		});
		process.exit(1);
	}
}

run().catch(console.error);
