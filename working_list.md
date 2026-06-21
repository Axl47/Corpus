---
created_at: 2026-06-21T03:24
updated_at: 2026-06-21T04:06
---
# Working List

## Known Follow-Up
- [ ] Clean the repo-wide lint baseline; `npm run lint` currently fails on existing React compiler/script issues
- [ ] Decide separately whether to clean legacy payment-related DB objects from existing local databases

## Done
- [x] Confirmed `corpus-mcp` tools are not available in this session; using local checklist instead
- [x] Read relevant Next.js App Router docs for route handlers, server functions, and project structure
- [x] Read payment guidance and confirmed the target is removal, not a replacement flow
- [x] Map payment, entitlement, and account-tier references across runtime code
- [x] Remove payment routes, payment helpers, entitlement services/actions, and the external payment package dependency
- [x] Make local-first quota checks unlimited without user-facing plan language
- [x] Remove payment and entitlement UI from workspace, mobile, admin, user settings, and landing surfaces
- [x] Clean i18n keys and project docs
- [x] Run `npx tsc --noEmit` successfully
- [x] Run payment/billing reference scans successfully
- [x] Run `npm run lint`; it still fails on existing repo-wide lint debt unrelated to payment removal
