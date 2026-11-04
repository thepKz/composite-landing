# Populated editorial review — 2026-11-04

- Used one explicitly marked temporary local article with a long title, portrait cover, body image and four-column table to inspect populated news/detail and authenticated admin editing. Removed that exact fixture after inspection (one row deleted, zero remaining); no customer article changed.
- Editorial heading now pairs title/excerpt with an uncropped portrait or landscape cover; breadcrumb no longer repeats the long title. Body keeps a readable760px maximum. News thumbnails preserve the entire image.
- Table cell paragraphs are left aligned instead of inheriting justified body copy. Tables scroll within their own focusable region on mobile. Browser390px confirms no page overflow, image object-fit contain and table text-align left.
- Admin title is now an expanding textarea that retains single-line title data. Existing long title fully fits160px of content/visible height on390px; editor has no horizontal overflow. No save operation was performed.
- Production build passed after component edits; final TypeScript passed after thumbnail CSS. Evidence: `editorial-long-desktop.png`, `admin-long-title-mobile.png`, `news-populated-mobile.png` under `.impeccable/review/`. Earlier table screenshot is before the cell alignment correction; computed final alignment was verified afterward.
- Goal remains active pending the broader visual direction review and user feedback on the main source of dissatisfaction.

# Craft follow-up — active goal, 2026-11-04

- Removed the duplicate catalogue introduction/banner; products now follow the application filters directly. Compact cards show applications instead of repeating the full description. Browser filter for aquaculture returns one matching card;390px layout has no horizontal overflow.
- Fixed footer desktop grid from three tracks for four groups to four tracks. Secondary pages use a compact signature; homepage retains its larger finale. Desktop footer verified visually.
- Admin product list and editor now preview the same CMS/default image used publicly and identify the source. Authenticated biogas editor confirmed the default image loads.
- Floating quote link points to an existing page-local inquiry form and disappears while that form intersects the viewport. Browser verified `#tu-van`, then zero floating links with the form visible.
- Build including TypeScript passes. Evidence: `.impeccable/review/catalogue-refinement.png`, `admin-source-consistency.png`.
- Overall craft goal remains active: these checks prove the listed corrections, not whole-site visual acceptance. Populated editorial pages, complete route-to-route visual consistency, and all long-content admin states still need a coherent final review.

# Product, secondary pages and admin refinement — 2026-11-04

- Product details now put one selected photograph, thumbnails, specifications and inquiry CTA together. Four native disclosures retain the technical guidance; related products use compact links instead of repeated descriptive cards. CMS covers still take precedence; ambiguous families are not assigned guessed photographs.
- Compact product inquiry retains all payload fields. Optional fields expand on invalid input; browser verified with invalid email without submitting an inquiry.
- About, contact, news, projects and ordering guide were visually reviewed on desktop and checked for horizontal overflow at390px; all five passed. News has no published records in this local database, so populated news cards were not verified this round.
- Authenticated admin product editing, media picker/search and mobile article editor were inspected. The library contains26 images after adding18 existing optimized customer photos. Re-running the importer adds0 files and preserves metadata. No product or article was saved during visual checks.
- Production build including TypeScript and23 unit tests pass. Existing live-dev log retained temporary missing-CSS errors while the secondary-page agent was still writing its new stylesheet; final routes rendered and the production build resolved that stylesheet.
- Evidence: `.impeccable/review/product-detail-refined.png`, `admin-product-refined.png`, `secondary-about.png`. Full CMS publication/backup workflows were not rerun for this presentation change.

# Cinematic homepage — 2026-11-04

- Production build and TypeScript pass after the redesigned homepage and customer product image integration.
- Latest revision: production build (including TypeScript) passes after the final workshop spacing correction. Browser1280x720 has exactly two pins (hero and workshop); About removes both and returning home restores exactly two. Reduced-motion removes both and leaves the heading visible and workshop in normal flow.
- Browser390x844 has no horizontal overflow or pins; hero CTA precedes the photograph. Workshop spread was visually checked after reload: all three frames and captions are separated. Dialog next/previous and Escape pass; focus returns to the opening image. Browser error log is empty during these checks.
- Latest screenshots: `.impeccable/review/morph-laptop.png`, `morph-mobile.png`, `workshop-spread.png`. Hero uses installed GSAP MorphSVG and six opening shutters; no dependency was added.
- Mobile390 layout has no horizontal overflow, all loaded images valid. Product selection changes the photograph and keeps only one disclosure open.
- Nine initial editorial/product image sources on the homepage are distinct (excluding the hidden lightbox's enlarged version of the selected gallery photo). Product CMS images keep priority. Three technically ambiguous groups remain specification-led.
- HTTP catalogue, mapped detail and unmapped detail routes return200. No new dependencies, schema changes or Netlify export in this iteration.
- Browser's first failed load was due to stopped Docker/PostgreSQL services. Existing database container restarted; application now serves from localhost3002.
- Design detector returned advisory palette/type/radius documentation differences; the intentional cinematic scale and image apertures are recorded in DESIGN.md.

---

# Acceptance evidence - 2026-11-03

This records the locally implemented and tested deliverable. It does not claim a public deployment or search ranking.

| Requirement | Current evidence | Result |
| --- | --- | --- |
| Thanh Loi landing page and reference-led structure | Real-photo homepage, catalogue, specifications, gallery, FAQ, consultation, footer; final desktop/mobile screenshots independently reviewed | Pass |
| Latest instruction replacing 3D | No 3D components/dependencies; eight customer ZIP images and decorative generated backdrop; asset provenance in assets/README.md | Pass |
| Concise copy, justified paragraphs, natural wraps | landing.css and final screenshots; no manual heading line breaks; four viewport overflow/image checks | Pass |
| Seven product families and exact supplied dimensions | Seven published database products; all detail routes return 200; biogas five diameters and septic from 1 cubic metre | Pass |
| /admin with nontechnical publishing toolkit | Tiptap headings/lists/links/tables/formatting/media, templates, draft/preview/publish, revisions, conflict handling, SEO panel | Implemented and tested |
| Real publishing workflow | verify-admin-ui.ts drives login, media selection, draft save, preview, publish, public article and mobile layout | Pass |
| Prevent loss during save/navigation | Editing locked during save, logout cancellation, per-tab unsaved recovery; browser regression covers save lock and reload recovery | Pass within tested paths |
| Image and video storage | Persistent filesystem with database metadata/relations; validated upload, image optimization, private unpublished media, ranged video | Pass: CMS integration |
| SEO | Canonicals, Article/Product JSON-LD, editable metadata, sitemap, robots, slug 301 redirects and draft exclusion | Pass: source and HTTP integration |
| Authentication and content safety | Server checks, scrypt, hashed sessions, CSRF origin checks, bounded inputs, sanitized rich text, upload content checks | 11 unit tests and 38 CMS integration checks pass |
| Persistent portable data | PostgreSQL migration/seed, Dockerfile, Compose, configuration template, first-admin command | Pass |
| Backup and restore | Manifest SHA-256, database dump plus media, write-lock consistency, new destination only, sessions excluded | Pass |
| Restore actual content, not just a dump file | verify-restoration.mjs restores published article/image/video to a new database; compares every table and media hash; Docker opens restored article and video bytes | Pass |
| Failure protection and repeated handoff | Existing target refused; corrupt dump refused before database creation; restored database can be backed up and restored again | Pass |
| Production packaging | Standalone Docker build; 38 CMS integration checks against restored database and mounted media | Pass |
| Skill workflow and delegation | ICS workbench central implementation, independent reference/security/handoff/visual reviews; layout/distill and final design documentation | Complete |
| Usable handoff | ADMIN-GUIDE.md, HANDOFF.md, README.md; verified local admin credentials in ignored data/admin-access.txt; delivery backup in backups/delivery-ready | Complete |

## Review closure

Independent visual reviewer returned SHIP after reviewing the final copy screenshots. Independent handoff reviewer closed both identified issues: backing up renamed restored databases and special-character production passwords. Documentation reviewer refreshed DESIGN.md and its sidecar from the implemented CSS.

Browser testing found and fixed an editor dirty-state bug from setEditable emitting an update and a stale fetch overwriting restored content. Standalone runtime testing found and fixed the missing dynamically loaded strtok3 file in the media validator. Final relevant checks passed after these fixes.

## Operational limits

- Official phone/email/Zalo and exact address must be entered before public launch. No invented contact details are used.
- Homepage photo placements are static source assets; posts/products/contact information and their media are editable in admin.
- Media deletion and automatic email/Zalo notifications are not implemented. Inquiry records are available in admin.
- Domain, TLS and external hosting have not been deployed. Deployment procedures are documented; infrastructure remains the owner's choice.
- Local restore-test databases/folders remain isolated from the live local database. They are evidence fixtures, not the delivery data source.
- The directory has no Git repository, so no Git diff/commit is claimed.

## Whole-site redesign verification (2026-11-03, latest)

This supersedes earlier homepage-only visual conclusions above. Public styles now load through the public layout from `public.css`; old landing styles are not imported.

- Shared navy/teal/sage backgrounds, real customer photographs, consistent photo frames and product specification cards. No invented product photo assignments.
- Dedicated About, Contact and News routes, product category filtering, detail guidance/FAQ/related products, and a unified accessible product dropdown.
- GSAP/ScrollTrigger route entry and scroll motion, CSS slideshow/menu/accordion transitions, reduced-motion handling.
- Typecheck and production build passed; 11 unit tests and 40 CMS API checks passed, including old news URLs and renamed aliases redirecting directly to the new canonical.
- News agent tested search escaping, 9+3 pagination, kind filter, draft/future exclusion, alias history and unpublish in rolled-back database transactions.
- Browser: 28 route/viewport checks (7 routes at 360/390/768/1440) found no horizontal overflow or completed-but-broken images. Lazy image loading was separately checked by scrolling the homepage.
- Browser: product filter, product-specific form preselection, successful inquiry submission and database persistence confirmed; that exact test inquiry was removed.
- Browser: unified dropdown opens with click/ArrowDown, closes with Escape/selection, stays inside the 1024/1440 viewport, and uses a single column on mobile. Reduced motion disables slideshow autoplay and heading transforms.
- Evidence: `.impeccable/review/redesign/` contains full-page homepage captures, product and dropdown captures, and `responsive.json`.
- Current data gaps: no official news posts, no product cover assignments, and missing phone/email/Zalo/exact address. The news page presents an honest empty state; product cards use factual specifications until correct photos are assigned.
- The older delivery backup predates this redesign; it is not a backup of the latest source. Pre-redesign source snapshot: `backups/public-redesign-20261103-134524/`.
- No-JavaScript browser check: heading and product links remain visible; the static page does not depend on animation to reveal content.
- Latest dropdown correction replaces the split label/arrow with one disclosure button, a two-column desktop panel and a one-column mobile panel. Keyboard focus remains visible. Independent scoped code review found no material behavior issue.

## 2026-11-04 color/motion pass

Build and TypeScript passed after markup/motion changes. Final CSS review fixed contact-page contrast by scoping the new dark contact surface to the homepage, and fixed sticky containment with overflow:clip.
Browser: homepage desktop and 390px mobile inspected; no horizontal overflow at inspected sizes. Photo mask corrected to avoid clipping copy. Browser log inspection returned no errors. Standalone export tested on http://127.0.0.1:3011: images loaded, controller enabled, mobile product dropdown opened with aria-expanded=true. Screenshot: .impeccable/review/bolder-netlify.png.
Netlify ZIP regenerated. No external deployment performed. Reduced-motion behavior inspected in code, not emulated in this pass. Broader redesign goal (full reference study and catalogue storytelling) is not certified complete by this pass.

## Final landing review - 2026-11-04

Supersedes the earlier partial-pass status. See docs/landing-redesign-audit-20261104.md for requirement-by-requirement evidence, real reference observations, current screenshot paths and verification scope. Fullpage desktop and mobile footer reviewed by a separate reviewer without visual blockers. Reduced-motion and no-JavaScript disclosure behavior were now tested in the browser. Build passed; standalone asset audit and final ZIP completed.
# Website nhiều trang và quản trị GMT+7 — 2026-11-04

- Production build và TypeScript: PASS.
- Unit tests: 23/23 PASS.
- CMS integration (`scripts/verify-cms.ts`): 40/40 PASS.
- Project routes (`scripts/verify-project-routes.ts`): 23/23 PASS, gồm alias sau hai lần đổi slug và chặn nội dung hẹn giờ.
- Authentication integration: 21 kiểm tra PASS; kiểm tra lỗi database trong môi trường giả lập đạt. Cookie Secure trên HTTPS production chưa kiểm tra độc lập.
- UI admin: lưu nháp, hẹn giờ GMT+7, sửa giữ lịch, hủy về nháp đạt; fixture đã dọn.
- Demo: 26 trang HTML, 1.418 tham chiếu nội bộ/asset không hỏng. Kiểm tra trình duyệt dropdown mobile390, điều hướng About/product/news và tìm kiếm tĩnh đạt. Desktop1440 không tràn ngang; GSAP hoàn tất với tiêu đề opacity1.
- Ảnh kiểm tra: `.impeccable/review/website-final-desktop.png`, `admin-schedule-final.png`, `admin-schedule-mobile.png`.
- Gói bàn giao: `deliverables/THANH-LOI-NETLIFY-WEBSITE-DEMO.zip`; chưa deploy bên ngoài. Admin/database/lịch đăng không nằm trong demo HTML.


## Follow-up: product clarity and navigation (2026-11-04)
- Workshop cards now animate width to 30% at scale 1, preserving 14px captions and 44px image controls; inspected spread state in browser.
- Product gallery uses framed forest/lime composition and native enlarged-image dialog. Browser verified opening, Escape dismissal and focus restoration; 390px viewport has no horizontal overflow.
- Catalogue families without verified imagery show specifications instead of tall empty photo placeholders. Wastewater group uses the same compact catalogue cards.
- Floating quotation action hides while homepage hero or inquiry form is visible.
- Guide deep links open disclosures on initial navigation and same-page link clicks; verified transport footer link opens its section.
- Admin article actions remain sticky below the mobile header; agent checked desktop/mobile without modifying post data.
- Final npm run build passed; npm test passed 23/23.
- Evidence: .impeccable/review/product-frame-final.png, workshop-readable-final.png, admin-sticky-actions-mobile.png.

## Final interaction review — 2026-11-04
- Mobile media selection now scrolls to the selected-file panel and displays a contained preview. Browser390px: preview loaded1200px, panel visible, no horizontal overflow.
- Choosing the image closes the picker and restores focus/scroll to the product cover control. Returned to the list without saving the draft change; customer product data unchanged.
- Mobile navigation: menu opens, product dropdown fits within its scrolling panel, aquaculture link opens the correct detail and collapses the menu. No horizontal overflow.
- Evidence: .impeccable/review/admin-media-picker-mobile.png.

## Scope closure
- Visual direction: forest/lime/paper, real customer imagery, distinct hero aperture/shutters and workshop spread, framed product gallery; screenshot evidence recorded above.
- Product reading: selected photo/thumbnails, concise introduction, specifications, collapsed supporting guidance and compact inquiry form; current product-frame-final.png replaces the earlier blank product-detail-refined.png evidence.
- Secondary pages: about/contact/news/projects/order guide share typography and page rhythm; populated article and long-title/table cases checked using removed local QA data.
- Admin: product/public image consistency, library search/preview/select flow, long-title editor, sticky article save actions verified without saving customer content.
- Navigation: sticky header, dropdown, same-page disclosure links and local quotation links verified; hero/form floating CTA overlap removed.
- Content truth: supplied photos retained; unverified chemical/wastewater/septic image identities remain specification-led. News/projects have no published customer records in the current database; their empty states and populated editorial template were checked separately.
- No production deployment requested or performed. No API, database schema or business-rule change in this refinement.

## Admin usability update — 2026-11-04
- Product list supports accent-insensitive name/category search, publication filters with counts, result totals and reset. Browser query `  THUY   SAN  ` returned the correct one of eight products; hidden filter returned the empty state; reset restored all eight.
- Product and article tables use labeled stacked rows at mobile widths; product390px screenshot shows no horizontal scrolling and an accessible edit action.
- Product save action/status/error share a sticky toolbar. Browser mobile scroll confirms top64 matches the header bottom64 and exactly one Save product button remains. Existing submit handler and fieldset save lock retained.
- Article filtered empty state offers reset instead of inviting a duplicate new article. Reset verified in browser; populated article rows were not available in this database for this pass.
- Media search `dang cau` finds the Vietnamese spherical-tank description. Shared search normalization preserves stored text.
- TypeScript and production build pass. No customer data saved/modified.
- Screenshots: admin-search-mobile.png and admin-search-desktop.png in .impeccable/review/.
