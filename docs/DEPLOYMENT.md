# admin.cinagroup.com 部署 Runbook

> 本文档覆盖 **cinaauth（auth.cinagroup.com）** 与 **cinaadmin（admin.cinagroup.com）** 的生产部署、密钥配置、会话域、角色种子与日常运维。

---

## 0. 前置条件

| 项 | 要求 |
|---|---|
| Cloudflare 账号 | 拥有 `cinagroup.com` zone 的管理权限（用于 Pages + DNS + WAF） |
| GitHub | `cinagroup/cinaauth` 与 `cinagroup/cinaadmin` 仓库的写权限 |
| 共享 D1 数据库 | cinaauth 与 admin 控制台**共用同一个 D1**（控制台经 cinaauth API 访问，不直连） |
| 会话 cookie 域 | cinaauth 会话 cookie 必须作用域为 `.cinagroup.com`（共享子域） |

---

## 1. 部署 cinaauth（auth.cinagroup.com）

### 1.1 Cloudflare Worker/Pages 配置

cinaauth 部署在 Cloudflare（Worker 或 Pages）。关键环境变量（在 Cloudflare Dashboard → 该项目 → Settings → Variables and Secrets）：

| 变量 | 类型 | 说明 |
|---|---|---|
| `BETTER_AUTH_SECRET` | Secret | 会话签名密钥，**生产唯一**，勿与 staging 共用 |
| `BETTER_AUTH_URL` | Var | `https://auth.cinagroup.com` |
| `D1_DATABASE_ID` | Var | 共享 D1 数据库 ID |
| `CINAUTH_ADMIN_SERVICE_KEY` | Secret | 控制台调用 cinaauth 的服务标识（见 §2.2） |
| `TRUSTED_ORIGINS` | Var | 允许的来源（见 §4） |

### 1.2 会话 cookie 域（关键）

cinaauth 的 `advanced.setCookies` 配置中，会话 cookie 的 `domain` 必须设为 `.cinagroup.com`：

```ts
// cinaauth 配置
advanced: {
  setCookies: {
    session_token: { domain: ".cinagroup.com", sameSite: "lax" },
    // 其它 cookie 同理
  },
}
```

**若不设此项**，`admin.cinagroup.com` 无法读取 cinaauth 会话 cookie，控制台将无法登录。本地开发用 hosts 把 `auth.localhost` / `admin.localhost` 指向 `127.0.0.1` 测试跨子域。

### 1.3 启用插件

确认 cinaauth 实例加载了以下插件（Phase 0 已实现，部署前核对）：

```ts
plugins: [
  admin({ adminRoles: ["admin", "security_admin"] }),
  auditLog({
    allowedRoles: ["admin", "security_admin"],
    writeTokens: [process.env.CINAUTH_ADMIN_SERVICE_KEY],
  }),
  siwe({ ... }),
  twoFactor(),
  emailOtp(),
  organization(),
  // bearer (api-key) 插件 — 若启用 API 密钥管理
],
```

### 1.4 迁移

每次 cinaauth 部署后，新 schema（如 `auditLog` 表）通过 cinaauth 的自动迁移应用到 D1。首次部署后确认：

```bash
wrangler d1 execute <DB_NAME> --command "SELECT name FROM sqlite_master WHERE type='table' AND name='auditLog'"
# 应返回 auditLog 表
```

---

## 2. 部署 cinaadmin（admin.cinagroup.com）

### 2.1 Cloudflare Pages 项目

1. Cloudflare Dashboard → Pages → Create project → Connect to Git → 选 `cinagroup/cinaadmin`
2. Build 配置：
   - Framework preset: `Next.js`
   - Build command: `npx @cloudflare/next-on-pages`
   - Build output: `.next`（或 `worker`，视 Next 16 + @opennextjs/cloudflare 版本）
3. 自定义域：`admin.cinagroup.com`（绑定到该 Pages 项目）

### 2.2 环境变量 / Secrets

在 Cloudflare Pages → 该项目 → Settings → Environment variables：

| 变量 | 类型 | 说明 |
|---|---|---|
| `CINAUTH_BASE_URL` | Secret/Var | `https://auth.cinagroup.com` |
| `CINAUTH_ADMIN_SERVICE_KEY` | **Secret** | 与 cinaauth 的 `CINAUTH_ADMIN_SERVICE_KEY` **完全一致** |
| `CINAADMIN_ALLOWED_ROLES` | Var | `super_admin,security_admin` |
| `NEXT_PUBLIC_APP_NAME` | Var | `CinaGroup Admin` |
| `NEXT_PUBLIC_CINAUTH_BASE_URL` | Var | `https://auth.cinagroup.com`（客户端登出跳转用） |

> ⚠️ `CINAUTH_ADMIN_SERVICE_KEY` 是 secret，**不在客户端 bundle**（仅在 Route Handler/middleware 服务端使用，已验证无泄漏）。

### 2.3 构建

```bash
cd cinaadmin
pnpm install --frozen-lockfile
pnpm build:cf   # = npx @cloudflare/next-on-pages
pnpm preview    # 本地 wrangler 预览
```

### 2.4 首次部署后验证

1. 访问 `https://admin.cinagroup.com` → 应重定向到 `https://auth.cinagroup.com/sign-in?callbackURL=...`
2. 用 super_admin 账号登录 → 回跳控制台，看到仪表盘
3. 用普通 user 账号登录 → 应收到 403 页面

---

## 3. 角色种子（首次设置）

控制台需要至少一个 `super_admin` 账号。方式：用 cinaauth 的 admin 插件 `set-role` 端点，或直接在 D1 设置：

```bash
# 方法 A：经已认证的 admin API（需已有任意 admin）
curl -X POST https://auth.cinagroup.com/admin/set-role \
  -H "cookie: <admin-session-cookie>" \
  -H "content-type: application/json" \
  -d '{"userId":"<目标用户ID>","role":"super_admin"}'

# 方法 B：直接 D1（紧急/首次，无既有 admin 时）
wrangler d1 execute <DB_NAME> --command \
  "UPDATE user SET role='super_admin' WHERE email='your-admin@cinagroup.com'"
```

角色定义（Phase 0 已在 `access/statement.ts` 落地）：
- **super_admin** — 全 6 模块完全 CRUD
- **security_admin** — 封禁/解封 + 解绑钱包 + 会话吊销 + 审计读 + 统计读；**不可**建/删用户、API key、安全策略
- 其它 → 403

---

## 4. 安全加固（v1 后续）

v1 仅实现 `super_admin`/`security_admin` 角色网关。完整加固需在 Cloudflare Dashboard 配置：

### 4.1 Cloudflare WAF IP 白名单

Cloudflare Dashboard → Security → WAF → 创建规则：
- **匹配**：hostname = `admin.cinagroup.com` AND ip.src NOT IN {允许的运维 IP 段}
- **动作**：Block

这样仅允许指定 IP 访问 admin 控制台（控制台是高敏感面）。

### 4.2 强制 2FA 登录门

cinaauth `twoFactor` 插件配置：

```ts
twoFactor({
  // Phase 0 已支持；强门需在 admin 登录流程后接：检测 role ∈ {super_admin, security_admin} 且 2FA 未验证 → 强制挑战
  // 该强门为 v1 延后项（TODO），当前 2FA 由用户自行开启
})
```

### 4.3 审计保留

`auditLog` 表行**不可由控制台删除**。保留策略（附件要求 ≥90 天）由 D1 生命周期清理：

```bash
# 建议用 Cloudflare Cron Trigger + 一个清理 Worker，每日删除 90 天前的审计行
wrangler d1 execute <DB_NAME> --command \
  "DELETE FROM auditLog WHERE timestamp < datetime('now', '-90 days')"
```

---

## 5. 日常运维

### 5.1 常用操作（控制台 UI）

| 操作 | 路径 |
|---|---|
| 查看用户 | Users → 搜索（邮箱/用户名/钱包） |
| 封禁用户 | 用户详情 → 封禁（7/30/永久 + 原因） |
| 模拟登录（super_admin） | 用户详情 → 模拟登录（顶部金色横幅，点"停止模拟"退出） |
| 解绑钱包 | 用户详情 → 钱包 tab → 解绑 |
| 吊销会话 | 用户详情 → 会话 tab → 吊销全部；或 Sessions 全局列表 |
| 查审计 | Audit Log → 按类别/结果筛选，失败行标红 |
| 导出 | 用户列表 / 审计页 → 导出 CSV |

### 5.2 紧急排查

| 现象 | 排查 |
|---|---|
| 控制台登录后 403 | 确认账号 role ∈ {super_admin, security_admin}（D1 查 user.role） |
| 控制台无限重定向登录 | 检查 cinaauth cookie 域是否为 `.cinagroup.com`（§1.2） |
| 仪表盘数据全 0 | 确认 cinaauth 的 stats 端点可访问（curl `/admin/stats/overview`） |
| 审计无记录 | 确认 audit-log 插件已加载、auditLog 表存在（§1.4） |
| 钱包解绑后仍能登录 | 解绑会尽力吊销会话；若残留，手动 Sessions → 吊销 |

### 5.3 监控点

- cinaauth `/admin/stats/security-today` — 当日失败登录 / OTP 刷量
- cinaauth `/audit/alerts?windowHours=24&failThreshold=10` — 高频失败 IP/账号（可接 Webhook 告警，v1 后续）

---

## 6. 故障回滚

- **cinaauth**：Worker/Pages 支持版本回滚（Cloudflare Dashboard → Deployments → Rollback）
- **cinaadmin**：Pages 同理；每次 `main` 推送触发新部署，可在 Pages Deployments 选历史版本回滚

---

## 附：环境变量速查

### cinaauth（auth.cinagroup.com）
```
BETTER_AUTH_SECRET=<secret>
BETTER_AUTH_URL=https://auth.cinagroup.com
D1_DATABASE_ID=<d1-id>
CINAUTH_ADMIN_SERVICE_KEY=<shared-secret-with-admin>
TRUSTED_ORIGINS=https://admin.cinagroup.com,https://cinacoin.cinagroup.com,...
```

### cinaadmin（admin.cinagroup.com）
```
CINAUTH_BASE_URL=https://auth.cinagroup.com
CINAUTH_ADMIN_SERVICE_KEY=<shared-secret-with-auth>
CINAADMIN_ALLOWED_ROLES=super_admin,security_admin
NEXT_PUBLIC_APP_NAME=CinaGroup Admin
NEXT_PUBLIC_CINAUTH_BASE_URL=https://auth.cinagroup.com
```

> `CINAUTH_ADMIN_SERVICE_KEY` 在两个项目**必须相同**（控制台用它标识调用方，cinaauth 接收并校验）。
