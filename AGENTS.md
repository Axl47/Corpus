<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.

<!-- END:nextjs-agent-rules -->

# Keeping This File Up to Date

**Every agent that makes structural changes to the project MUST update this file before finishing.**
Structural changes include: adding/removing tables, adding routes, adding/removing components, adding server actions, or changing architectural patterns.
If you skip this step, future agents will work from a stale map and make mistakes.

---

# ExecPlans

When writing complex features or significant refactors, use an ExecPlan (as described in `.docs/PLANS.md`) from design to implementation. New plans should be standalone `.html` files in `.docs/exec/`.

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

## Task Completion Checklist

Run these after any coding task:

1. **Type check** — TypeScript strict mode; check for `@ts-ignore` added (only acceptable for Tiptap's `renderMarkdown` field)
   ```sh
   npx tsc --noEmit
   ```

2. **Lint**
   ```sh
   npm run lint
   ```

3. **i18n keys** — if any new user-facing string was added:
   - Verify key exists in all 6 `messages/*.json` files
   - No hardcoded strings remain in components

4. **Migration** — if `src/db/schema.ts` was changed:
   ```sh
   npx drizzle-kit generate
   npx tsx src/db/migrate.ts
   ```
   Ensure new migration `when` value is greater than all existing (next: > `1781500000000`). NOTE: libsql `batch()` no-ops DDL, so recent migrations use manual `src/db/apply-00xx-*.ts` scripts — apply to local.
