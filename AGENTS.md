<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.

<!-- END:nextjs-agent-rules -->

# Keeping This File Up to Date

**Every agent that makes structural changes to the project MUST update this file before finishing.**
Structural changes include: adding/removing tables, adding routes, adding/removing components, adding server actions, or changing architectural patterns.
If you skip this step, future agents will work from a stale map and make mistakes.

---

# Project Details: Corpus

**Corpus** is a Notion-like application built around a **workspace** model. Users can create standalone pages (title + markdown) and customizable databases (dynamic columns, table/kanban/calendar views) — both living side by side in a unified sidebar. Each database row is also a page with markdown content.

## i18n & Localization

Corpus is fully internationalized using **next-intl v4** (App Router native). All user-facing text is loaded from translation files — **no hardcoded strings in components**.

### Supported Languages

| Code | Language          |
| ---- | ----------------- |
| `en` | English (default) |
| `tr` | Türkçe            |
| `hi` | हिन्दी            |
| `es` | Español           |
| `fr` | Français          |
| `de` | Deutsch           |

### Locale Resolution (priority order)

1. `NEXT_LOCALE` cookie (user picks via `LanguageSwitcher`, 1-year expiry)
2. `Accept-Language` header (auto OS language detection via `negotiator` + `@formatjs/intl-localematcher`)
3. `en` fallback

**Clean URLs:** `localePrefix: 'never'` — URLs stay as `/db/123`, never `/en/db/123`. All pages live under `src/app/[locale]/`.

**Translation files:** `messages/{locale}.json` — `en.json` is the source of truth. **26 namespaces:** `Layout`, `Home`, `Auth`, `Workspace`, `WorkspaceSettings`, `Templates`, `Database`, `Editor`, `Page`, `IconPicker`, `Admin`, `Errors`, `LanguageSwitcher`, `MobileNav`, `Landing`, `Billing`, `Pricing`, `Contact`, `Download`, `Privacy`, `Updater`, `Sharing`, `UserSettings`, `OAuthAuthorize`, `Security`, `Consent`.

### Rules for All Future Development

**Every new component or server action that surfaces user-facing text MUST follow these rules:**

1. **Client components** — `import { useTranslations } from 'next-intl'` and call `useTranslations('Namespace')` inside the component body.
2. **Server components / layouts** — `import { getTranslations } from 'next-intl/server'` and `await getTranslations('Namespace')`.
3. **Server actions** — same as above; use `getTranslations('Errors')` for error messages returned to the client.
4. **Add all new keys to ALL 6 files** before committing. Missing keys fall back to the key name.
5. **No hardcoded display strings** — not even English fallbacks like `|| 'Untitled'`. Always use `t('key')`.
6. **Date formatting** — use `useLocale()` (client) or locale from `getRequestConfig` (server) instead of `'en-US'`.
7. **Namespace selection** — pick the closest existing namespace. Create a new one only for a clearly standalone domain (add to all 6 files and document here).

### Agent Task Management & Work Plan

When working on project tasks, agents MUST use the **corpus-mcp** server to interact with the **Work Plan** database:
1. **Querying Tasks:** Retrieve pending tasks (e.g. Sprint-specific) from the "Work Plan" database using the `query_database` tool (optionally listing all rows and filtering in memory if database query filters fail).
2. **Updating Status:** When starting a task, update its status to `In Progress` (if applicable), and when completed, update its status to `Done` in the database via the `update_page` tool.
3. **Writing Task Outputs:** Upon task completion, write a detailed markdown summary of the changes made, files modified, and test outcomes directly into the task's page content in the database using the `update_page` tool.

## Color Theme

| Role                | Hex       | Tailwind token |
| ------------------- | --------- | -------------- |
| Main canvas bg      | `#1d1f23` | `neutral-950`  |
| Sidebar / card bg   | `#21252b` | `neutral-900`  |
| Content canvas bg   | `#282c34` | `neutral-850`  |
| Borders / dividers  | `#383b41` | `neutral-800`  |
| Silver text         | `#cccccc` | `neutral-100`  |
| Muted text          | `#d7dae0` | `neutral-50`   |
| Primary / accent    | `#445c95` | `blue-500`     |
| Destructive         | `#cd4d55` | `red-400`      |
| Success             | `#7fc36d` | `green-400`    |
| Warning             | `#cc7d45` | `amber-500`    |

Tokens defined via `@theme` overrides in `src/app/globals.css`.

## UI & Design Aesthetics

- **Flat and borderless:** Settings panels, drawers, sidebars — always `rounded-none`, no shadows.
- **Three-tier background:** `neutral-950` body frame → `neutral-900` sidebars/floating panels → `neutral-850` content/canvas. Separate with a single `border-neutral-800` line.
- **Flat-Line Separators:** Use `border-b border-neutral-850` + `hover:bg-neutral-800/10` rows instead of cards.
- **Auth Pages Exception:** `/login` and `/register` use `rounded-xl` cards and `rounded-lg` inputs. Do not apply this style inside the workspace.

## Technology Stack

- **Framework:** Next.js 15 (App Router)
- **Styling:** TailwindCSS, Lucide React icons
- **Database:** SQLite (`file:local.db`), Turso/Serverless compatible target.
- **ORM & Driver:** Drizzle ORM + `@libsql/client`.
- **Image Uploads:** Cloudinary (`cloudinary` npm). Upload API at `POST /api/upload`. Env vars: `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET`. Images stored in `corpus/icons/` folder, auto-resized to 256×256.
- **Auth:** Auth.js v5 (`next-auth@beta`) + `@auth/drizzle-adapter` + `bcryptjs`.
- **Desktop:** Tauri v2 (Rust shell, loads `corpus.com` in system WebView).
- **Mobile:** Capacitor v8 (iOS + Android, loads `corpus.com` via `server.url`).
- **PWA:** `@ducanh2912/next-pwa` (Workbox service worker, `public/manifest.json`).

## Architecture and Conventions

If you have any questions of the codebase or why certain decisions were made, you can read more at `.docs/ARCHITECTURE.md`.

### Common Commands

- **Start Dev Server:** `npm run dev`
- **Generate Migrations:** `npx drizzle-kit generate`
- **Apply Migrations:** `npx tsx src/db/migrate.ts`
- **Desktop dev (Tauri):** `npm run tauri:dev` — requires Rust + Visual C++ Build Tools
- **Desktop build:** `npm run tauri:build`
- **Generate Tauri icons:** `npm run tauri:icon` — run once after Rust is installed
- **Android open:** `npm run cap:open:android` — opens Android Studio
- **Android run:** `npm run cap:android`
- **iOS open (macOS only):** `npm run cap:open:ios`
- **Sync Capacitor:** `npm run cap:sync` — call after changing `capacitor.config.ts`
- **Build Claude Desktop bundle:** `npm run mcpb:build` — installs the bundled proxy + packs `mcpb-build/corpus.mcpb` (see **Claude Desktop (.mcpb bundle)**)

### Cross-Platform Architecture

**Strategy:** Cloud-first. All three platforms (web, desktop, mobile) load `corpus.com`. No separate API or local server required.

```
 corpus.com (Vercel)
       │
 ┌─────┼───────┐
 │     │       │
Web  Tauri  Capacitor
     Shell   Shell
    (Rust)  (iOS/Android)
```

**PWA** — `public/manifest.json` + Workbox service worker. Enables "Install App" in browsers and is the foundation for offline support. Disabled in `development` mode (`NODE_ENV`).

**Claude Desktop (`.mcpb` bundle)** (`mcpb/`) — one-click MCP install for Claude Desktop. `.mcpb` only packages a **local stdio** server, but Corpus's MCP is **remote HTTP** — so the bundle ships a thin launcher (`mcpb/server/index.js`) that runs the bundled [`mcp-remote`](https://www.npmjs.com/package/mcp-remote) proxy against `${user_config.server_url}` (default `https://www.corpus.com/api/mcp` — **must be the `www` canonical host**: the apex `corpus.com` 307-redirects to `www`, so the OAuth protected-resource metadata reports `www`, and `mcp-remote` fatally rejects a resource-indicator mismatch if handed the apex). `mcp-remote` bridges stdio ⇆ the remote Streamable-HTTP server and runs the **OAuth 2.1 + PKCE** browser flow on the first 401 (dynamic client registration against `/api/oauth/*`; the register endpoint already allows `localhost` redirect URIs). The launcher passes `--static-oauth-client-metadata '{"client_name":"Claude"}'` so the registered client is named "Claude" (mcp-remote otherwise registers a generic "MCP CLI Proxy") — this makes the connection show the Claude brand icon in `AgentsModal` out of the box. **No token to paste — real one-click + OAuth sign-in.**
- Files: `mcpb/manifest.json` (`manifest_version 0.3`, `server.type: "node"`, `user_config.server_url` for self-hosters), `mcpb/server/{index.js,package.json}` (deps: `mcp-remote`), `mcpb/icon.png` (from `public/logo-square-dark.png`), `mcpb/.mcpbignore`.
- Build: `npm run mcpb:build` (= `mcpb:install` + `mcpb:pack` via `npx @anthropic-ai/mcpb`) → `mcpb-build/corpus.mcpb` (~1.5 MB; `mcp-remote` + deps bundled so it's self-contained, no `npx` at runtime). Build outputs + `mcpb/server/node_modules/` + `*.pem` are git-ignored.
- **Signing:** `mcpb sign --self-signed` produces a valid PKCS#7 trailer but Claude Desktop still shows an **"unverified publisher"** warning for self-signed (and local `mcpb verify` can't validate it — node-forge pkcs7 verify + self-signed not in the OS trust store). **Production trust needs a CA-issued code-signing certificate** (`mcpb sign --cert cert.pem --key key.pem`), best run in release CI (Linux). Tracked as follow-up.
- **Distribution (follow-up):** not yet surfaced in the UI — wire a "Download for Claude Desktop" link (e.g. `/download` or `AgentsModal`) + attach `corpus.mcpb` to the GitHub release once signing is finalized.
- **Install test is manual** (needs the Claude Desktop GUI): double-click / drag `corpus.mcpb` into Settings → Extensions → sign in via OAuth → run the test prompt.

**Tauri** (`src-tauri/`) — Rust shell wrapping a system WebView.
- Dev: `build.devUrl = "http://localhost:3000"` signals CLI to wait; `setup()` hook navigates to `localhost:3000/tauri-app` via `window.eval` (`#[cfg(debug_assertions)]`).
- Prod: loads `https://corpus.com/tauri-app` (set via `app.windows[0].url`).
- Entry point `/tauri-app` sets `localStorage.platform=tauri` and detects OS locale before redirecting to `/app`.
- Features: system tray (single icon, built programmatically — **no** `trayIcon` config in `tauri.conf.json`), global shortcuts, notifications, deep-link (`corpus://` scheme).
- **Single instance:** `tauri-plugin-single-instance` (with `deep-link` feature) is registered **as the first plugin** in `lib.rs`. Because the app hides to tray instead of quitting, re-launching the binary would otherwise spawn duplicate processes/windows. The plugin's callback runs in the already-running primary instance — it focuses the existing window (`focus_main_window`) and the second process exits. On Windows/Linux the second instance receives `corpus://` deep-link URLs via `argv`, which the callback forwards to `handle_deep_link_url` (shared with the macOS `on_open_url` handler). Deep-link navigation uses the typed `WebviewWindow::navigate(Url)` API (never `eval` string interpolation) to avoid JS code injection from a crafted token.
- **Close to tray:** `CloseRequested` event is intercepted in `lib.rs`; window hides instead of quitting. Tray left-click or "Show Window" menu item restores it; "Quit Corpus" exits.
- **Desktop OAuth flow (polling / device-authorization):** Tauri login view generates a UUID `device_id` → opens `corpus.com/client-login?device_id=<uuid>` in the system browser via `@tauri-apps/plugin-opener` → user logs in (Google or GitHub) → browser POSTs to `/api/auth/client-bridge?device_id=<uuid>` which stores a 5-min JWT → browser shows "Close this tab" page → Tauri WebView polls `/api/auth/client-poll?device_id=<uuid>` every 2 s → on `{ ready: true, token }`, WebView navigates to `/api/auth/client-activate?token=…` → session cookie set → redirect to `/app`.
- Release CI: `.github/workflows/tauri-release.yml` — triggers on `v*` tags, builds Windows (`.msi`), macOS (`.dmg`, both Intel + Apple Silicon), Linux (`.deb`, `.AppImage`)
- **Requires:** Rust stable + Visual C++ Build Tools (Windows) / Xcode CLT (macOS)
- Icons: generated from `public/logo-square-dark.png` via `npm run tauri:icon` (after Rust install)

**Capacitor** (`capacitor.config.ts`, `android/`) — native WebView wrapper for iOS and Android.
- Loads `https://corpus.com` via `server.url` — no static export needed
- Plugins active: `SplashScreen`, `StatusBar`, `PushNotifications`, `Haptics`, `App`, `Keyboard`
- Dark theme colors (`#1d1f23`) set in `android/app/src/main/res/values/colors.xml`
- `android/` is committed to git (native project); `ios/` added on macOS via `npx cap add ios`
- **Requires:** Android Studio (Android) / Xcode on macOS (iOS)
