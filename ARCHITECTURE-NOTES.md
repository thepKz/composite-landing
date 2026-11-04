# Architecture research - proposed, not yet selected

## Reference evidence

Read-only HTTP inspection returned 200 for https://compositevietnam.com.vn/ and https://compositevietnam.com.vn/san-pham/bon-xlnt-composite-2-3x4-5m/.

Observed homepage structure: introduction, catalogue/products, project diary, news, video, partners and contact/policy footer. The inspected product detail blends product description with delivery narrative. Keep product specifications separate from projects in the new website.

Both Yoast and Rank Math metadata appear in the reference HTML. Use one metadata pipeline. Vietnamese pages should declare Vietnamese language/locale. These are source inspections, not browser performance or responsive findings.

## Proposed persistence

- Next.js public pages and authenticated administration.
- PostgreSQL for users, sessions, products, categories, posts, revisions, media metadata, inquiries, redirects and site settings.
- Rich text stored as versioned, allowlisted JSON, with a safe renderer. No arbitrary script or raw HTML publishing.
- Media files stored outside the database in a persistent volume or S3-compatible storage. Persist storage keys rather than deployment-specific absolute URLs.
- Docker Compose deployment on a VPS is a portable candidate. Local uploads require persistent storage; a transient serverless filesystem is unsuitable.
- If the actual hosting is PHP/cPanel only, revisit this proposal before implementation.

## Publishing workflow

Write, save draft, authenticated preview, publish. Use Vietnamese action labels and visible save/error states. SEO defaults derive from real title/excerpt; advanced settings stay collapsible. SEO guidance must not promise ranking.

Article editor should support headings, lists, links, quotes, tables, images with alt/caption, and video. Provide editable product specifications and content templates for project and knowledge articles. Preserve revisions; reject conflicting edits rather than silently overwriting them.

Published slug changes create redirects. Drafts are excluded from public queries, metadata and sitemap. Prevent deletion of referenced media. Empty states must explain the next action.

## Security acceptance

- Server-side authorization on every admin read and mutation.
- Hashed passwords and server sessions; no default admin password in source.
- HttpOnly cookies with production Secure flags; origin/CSRF validation and login rate limits.
- Server validation, safe link protocols, allowlisted rich-text rendering.
- Upload size, extension and actual content validation; generated filenames; reject executable formats and path traversal.
- Stream large media or use signed object-storage uploads; avoid unbounded RAM buffering.

## Handoff acceptance

Deliver migrations, configuration template, first-admin setup, deployment/update procedures, data export and backup/restore instructions. Backups include database and media with a manifest/checksums. Verify restoration in a clean environment and open restored posts, images and video. A successful dump alone does not prove recoverability.

## Design responsibilities

Public pages persuade through a clear product/application hierarchy and customer-supplied product photography. Administration prioritizes completing tasks with predictable navigation. Layout establishes grouping, rhythm, reading order and responsive behavior. Distill removes redundant controls and reveals advanced options progressively while preserving the full requested toolkit.

ICS Workbench has now been read from the Microsoft Store Claude package (path in TASKS.md). Its central-agent workflow is in effect, with bounded independent reviews. The user selected the familiar corporate website direction; see .impeccable/surface.md.
