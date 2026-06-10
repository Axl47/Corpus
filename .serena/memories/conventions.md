# Conventions

## i18n (CRITICAL)
- All user-facing strings via next-intl — NO hardcoded strings, not even `|| 'Untitled'`
- Client components: `useTranslations('Namespace')`
- Server components/layouts: `await getTranslations('Namespace')`
- Server actions: `getTranslations('Errors')` for error messages
- Add keys to ALL 6 files (en/tr/hi/es/fr/de) — missing keys cause runtime warnings
- 25 namespaces: Layout, Home, Auth, Workspace, WorkspaceSettings, Templates, Database, Editor, Page, IconPicker, Admin, Errors, LanguageSwitcher, MobileNav, Landing, Billing, Pricing, Contact, Download, Privacy, Updater, Sharing, UserSettings, OAuthAuthorize, Security
- `Billing` namespace: drives BillingModal + WorkspaceSettings Billing tab + MembersTab seat meter (tier_*/status_*/seats/agents/storage/unlimited/upgradeTo/manageBilling/seatsUsage/seatLimitHint etc). Billing limit error keys live in `Errors` (seatLimitReached/agentLimitReached/storageLimitReached/workspaceLimitReached/billingUnavailable/billingInvalidTier/billingNoCustomer)
- `Sharing` namespace keys include: tabSharing, shareButton, shareModalTitle/Hint, permissionLabel/Read/Write, slugLabel/Placeholder/Hint/Taken/Invalid, createShare, copyLink/linkCopied, revokeShare/Confirm, sharedAt, deleteWorkspaceSharedWarning, notFound, readOnlyBadge/writeBadge, saving/saveError, includeChildren/Hint, childrenShared, widthLabel/Narrow/Wide/Full, editShare, saveChanges, addToSitemap
- `Workspace` namespace includes `deleteConfirm` (interpolated with `{title}`) and `deleteCancel` keys for item-deletion confirmation modal
- `MobileNav` namespace keys: `menu`, `home`, `new`, `close`, `workspace`, `user`, `signOut` — used by `MobileNavWrapper`
- `Landing` namespace: drives `MarketingHeader`, `MarketingFooter`, `HeroSection`, `FeaturesSection` (navHome/navPricing/navContact/navSignIn/navGetStarted/hero*/feature*Title/Desc/footer* keys)
- `Pricing` namespace: drives `PricingSection` (free/pro tier content)
- `Contact` namespace: drives `ContactSection` (github/email/community channel cards)
- `Download` namespace: drives `DownloadView` (/download page) — title/subtitle/detecting/downloadFor/os*/file* keys for the desktop installer download grid

## Auth
- NEVER call `auth()` directly in server actions/components — use `getCurrentUser()` from `src/lib/auth/session.ts` (React.cache wrapped)
- All workspace actions → `assertWorkspaceAccess(workspaceId)`
- All database/page actions → `assertDatabaseAccess(databaseId)`
- Unauthenticated → `redirect('/login')`; unauthorized → throws

## Server Actions
- `useActionState`-compatible signature: `(_prevState, formData)` for form actions
- Revalidate with `revalidatePath('/')` ONLY for structural sidebar mutations (create/delete items); NOT for content edits

## UI / Design
- Flat, shadowless, `rounded-none` everywhere in workspace (no cards, no shadows)
- 3-tier bg: `bg-neutral-950` (outermost body), `bg-neutral-900` (sidebars/panels), `bg-neutral-850` (content/canvas)
- Borders: `border-neutral-800` single lines; no chunky cards
- Auth pages exception: `rounded-xl` card, `rounded-lg` inputs (deliberate contrast)
- All colors via `@theme` tokens in `globals.css` — use Tailwind tokens, not hex

## Data Patterns
- JSON column pattern for dynamic properties (no EAV, no extra tables)
- `SelectOption`: `{ value: string; color?: SelectOptionColor }` — `normalizeOption` for backward compat with plain strings
- Date formatting: `formatDateValue()` from `properties.ts`; never hardcode `'en-US'`

## Component Patterns
- Optimistic mutations: apply locally first, revalidate in background
- Editor: `key={page.id}` to remount `BlockEditor` on page switch
- `ChildBlock` markdown serialization: `<div data-cb-id="...">` (NOT custom elements — `marked` only parses standard HTML block elements)
- TanStack Query: installed via `QueryProvider` — use for client mutation hooks

## MCP / Agent Token Conventions
- Token format: `<MCP_TOKEN_PREFIX>_<prefix8>_<secret>` (env var `MCP_TOKEN_PREFIX=rmns`)
- Verification: look up by `tokenPrefix`, then `bcrypt.compare(secret, tokenHash)` — never iterate all tokens
- `/api/mcp` is whitelisted in `auth.config.ts` (`isMcpRoute`) so middleware never redirects MCP requests
- `export const runtime = 'nodejs'` required on MCP route (bcryptjs not Edge-compatible)
- Write tools must check `ctx.scope !== 'write'` and return an error — never execute the mutation
- Audit logs in `agent_activity` are best-effort (`.catch(() => {})` — tool response must not depend on audit success)
- New migrations after 0011 must use `when > 1780200000000`

## Performance
- `Promise.all` for independent fetches (no waterfalls in layouts)
- Loading skeletons in `loading.tsx` files for each route
