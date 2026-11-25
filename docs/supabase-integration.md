# Supabase integration

## Acceptance contract

The existing administrator manages products, articles, images and inquiries through the same admin UI. PostgreSQL and media persist in Supabase. Existing product IDs, media URLs, content and admin authorization must survive the move. Public visitors cannot read drafts, inquiries, credentials or sessions. The local source remains recoverable. No UI redesign, paid plan change or automatic production deployment belongs to this migration.

## Configuration

`.env` contains assignments only and stays ignored by Git. Never commit or share its contents. Copy the required variables individually into the hosting environment when deploying; `SITE_URL` must match that deployment's actual origin.

- `DATABASE_URL`: Supabase transaction pooler connection URI; percent-encode the password.
- `DATABASE_SSL_CA`: Supabase's trusted root certificate, with newlines represented as literal `\n`. TLS verification stays enabled. Do not add `sslmode` to the URI when supplying this CA through the application.
- `AUTH_PROVIDER=supabase`: verify credentials through Supabase Auth. Only verified Auth emails already in the application's `users` table can log in as administrators. `local` explicitly retains the original password verifier for local recovery.
- `SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`: project endpoint and browser-safe API key.
- `SUPABASE_SECRET_KEY`: server-only privileged API key; never prefix it with `NEXT_PUBLIC_`.
- `SUPABASE_STORAGE_BUCKET=thanhloi-media`: private bucket. App media endpoints retain draft/public access checks.
- `SUPABASE_UPLOAD_MAX_BYTES` and `NEXT_PUBLIC_UPLOAD_MAX_BYTES`: both `52428800` for the current Free plan. Images remain limited to 10 MB; videos to 50 MB. Raising these also requires an adequate Supabase bucket/project limit.
- `DEMO_MODE=false`: use actual data. `TRUST_PROXY` stays false unless the reverse proxy is known to replace the client IP header.
- SMTP variables remain independent from Supabase. Inquiry records are saved even if notification email is unavailable.

## Migration and recovery

`npm run db:migrate` applies SQL migrations in one transaction with a transaction-scoped advisory lock compatible with the pooler. Migration 003 enables RLS and removes anonymous/authenticated API grants from CMS tables. The server's PostgreSQL connection remains the authority for access.

`node --env-file=.env scripts/supabase-import.mjs` requires `LOCAL_DATABASE_URL`, an empty migrated destination, and local media in `UPLOAD_DIR`. It saves a local backup in ignored `backups/`, uploads and checksums all media, then imports CMS rows in one transaction. It refuses to overwrite existing destination rows or objects with different contents. Sessions and rate limits are intentionally not migrated. The local database and files are untouched. Do not rerun on a populated destination.

For rollback, stop the app and restore `DATABASE_URL` from `LOCAL_DATABASE_URL`, set `AUTH_PROVIDER=local`, clear `DATABASE_SSL_CA` and `SUPABASE_STORAGE_BUCKET`, then restart with the original `UPLOAD_DIR`. Supabase data remains intact; reconcile any content created after migration before using the old database as the live source.

## Admin lifecycle

Create a confirmed Auth user first. Run `admin:create` with `AUTH_PROVIDER=supabase` and `ADMIN_EMAIL` to allow an additional administrator explicitly; ordinary Supabase signups do not gain CMS access. Existing app sessions use secure HTTP-only cookies, expire after 12 hours, and are revoked on app logout. Changing Supabase credentials does not automatically revoke these independent app sessions; remove that user's rows from `sessions` to force immediate logout. MFA accounts fail closed until a challenge UI is implemented.

## Verification

Run `npm test`, `npm run typecheck` and `npm run build`. Verify actual admin login/logout, private media denial, image upload/edit/delete, product updates, inquiry persistence, and anonymous Data API denial against the configured deployment before release.

`node --env-file=.env --import tsx scripts/verify-supabase.ts` runs an authenticated integration check when `TEST_ADMIN_PASSWORD` is provided through the process environment. It creates and removes its own test media/product records. It skips HTTP inquiry submission when notification mail is configured, to avoid sending an unsolicited email.

Verified on 2026-11-25: 68 unit tests and production build pass. The live local app passed 29 integration assertions plus cleanup/logout checks against Supabase, including a direct upload larger than 4.5 MB, browser CORS, image editing, byte ranges, stale updates and Data API denial. Browser login and migrated photo display were checked. Inquiry persistence was additionally verified by invoking its route handler without a Next request context, so no notification email was scheduled. No hosted Vercel environment was modified or redeployed in this task.

Abandoned private staging objects older than three hours are cleaned in batches of up to 100 on a subsequent upload, at most once per hour. No background scheduler is required; cleanup waits until the next upload if the app is idle.
