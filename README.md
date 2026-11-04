# Thanh Loi Composite

Vietnamese product website and content administration. The public catalogue, customer photo gallery, inquiry flow, PostgreSQL storage, authenticated CMS, rich-text editor, media library, SEO metadata and sitemap are implemented. Docker packaging and database/media backup/restore have been verified locally. No external production deployment has been performed.

## Local development

Requirements: Node.js 24+, Docker Desktop (or a separate PostgreSQL 17 database).

1. `npm ci`
2. Copy `.env.example` to `.env`, choose a strong database password and keep `POSTGRES_PASSWORD` consistent with `DATABASE_URL`.
3. `docker compose up -d db`
4. `npm run db:migrate`
5. `npm run db:seed`
6. Set `ADMIN_EMAIL`, `ADMIN_PASSWORD` (12+ characters), optionally `ADMIN_NAME` for the current shell, then run `npm run admin:create`. Clear those environment variables afterward. Existing users are never overwritten.
7. `npm run dev -- --port 3002`

Set `SITE_URL=http://127.0.0.1:3002` when developing at that URL. Origin validation uses the configured site origin. The current local session uses port 3002 because port 3000 was already in use by another process.

`npm test`, `npm run typecheck`, `npm run build` verify the implemented foundation. Additional checks: `node --env-file=.env --import tsx scripts/verify-cms.ts` and `node --env-file=.env --import tsx scripts/verify-admin-ui.ts`. Handoff instructions are in HANDOFF.md; nontechnical instructions are in ADMIN-GUIDE.md.

## Storage and safety

- PostgreSQL data is in the Compose `database` volume, exposed only on loopback port 55432.
- Database credentials live in ignored `.env`, never source control.
- Migrations use a transaction and advisory lock. Seed inserts missing catalogue entries without overwriting edits.
- Passwords use salted scrypt; only session-token hashes are stored.
- Public forms have byte limits, validation, origin checks and database-backed rate limiting. `TRUST_PROXY=true` is only valid behind a configured reverse proxy that overwrites `X-Real-IP`; otherwise the global and per-identity limits apply.
- No external production deployment has been performed.

## Design and source material

The supplied image is the source of the cropped logo in `public/images/thanh-loi-logo.png`; a clean official logo is preferable for final publishing. Fonts come from the user's supplied ICS skill assets. The latest design uses eight customer photos from the supplied ZIPs; interactive 3D was removed at the owner's request. A generated fiberglass texture is decorative only. See assets/README.md for provenance.

The user selected a familiar corporate layout and confirmed compositevietnam.com.vn as the only client reference. See PRODUCT.md, REQUIREMENTS.md, TASKS.md and .impeccable/surface.md.

## Remaining delivery gates

Database/media restore, standalone Docker CMS and administrator publishing browser workflow have been verified. Homepage visual QA, image loading, gallery interaction and responsive overflow checks passed at 360, 390, 768 and 1440px. Confirm real contact details and company policy copy before production launch.
