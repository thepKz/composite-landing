# Thanh Loi Composite - requirements and acceptance evidence

## Confirmed source material

- User requests a complete public website, with a 3D product presentation and a CMS at `/admin`.
- Reference: https://compositevietnam.com.vn/ (structure reference, not permission to reuse claims or assets).
- Attached image identifies Thanh Loi Composite and the company name Cong ty Co phan Thanh Loi Composite (VN), Phu Tho. Contact details and logo source files remain unconfirmed.
- Required design skill: impeccable, including layout and distill.
- ICS Workbench and ics-skill-design-slide were located in the Microsoft Store Claude package. See TASKS.md for their exact root. Workbench keeps central integration and uses independent review. The slide skill does not require making slides for this website.

## Product catalogue

1. Biogas tanks: diameters 2.70 m, 2.45 m, 2.40 m, 2.25 m, 1.90 m.
2. Septic tanks: from 1 cubic metre, custom dimensions.
3. Wastewater treatment tanks.
4. Chemical storage tanks.
5. Aquaculture tanks.
6. Live shrimp/fish transport tanks for trucks and pickup trucks.
7. Household waste collection vehicles.

Dimensions above are user supplied. Do not infer capacity from diameter, chemical compatibility, certification, lifespan, warranty or treatment performance. A 3D model without engineering drawings must be identified as an illustrative model.

## Required delivery and evidence

| Requirement | Evidence required before completion |
| --- | --- |
| Complete Vietnamese public website | Running homepage, catalogue/product detail, articles/article detail, contact path; desktop/mobile inspection |
| 3D presentation | Rendered product scene, usable interaction, static fallback, reduced-motion handling; illustrative label |
| Nontechnical administration at /admin | Authenticated runtime walkthrough, clear labels and empty/error/success states |
| Article toolkit | Rich text headings, lists, links, images with alt text, video, draft/save/preview/publish workflow persisted across restart |
| SEO assistance | Editable title/description/slug, canonical, Vietnamese metadata, sitemap/robots, structured data using actual content; unpublished records excluded |
| Media library | Validated image/video upload, reusable selection, accessible media labels, size/type errors and persistence |
| Business content | All seven product categories and five biogas diameters represented without invented performance claims |
| Data and handoff | Schema/migrations, environment template, admin setup, backup/restore procedure including media, deployment guide, ownership/secrets instructions |
| Security | Protected admin/API, password hashing/session protection, server validation, upload restrictions, safe rendering and rate limiting |
| Verification | Relevant automated checks and running browser evidence; report any missing deployment or business inputs |
| Skill workflow | Layout/distill evidence, independent review, durable design documentation; requested ICS rules confirmed or explicitly unavailable |

## Working decisions awaiting confirmation

- Proposed stack: Next.js with PostgreSQL and portable media storage (local persistent volume or S3).
- Production hostname, hosting, phone/Zalo, operating coverage, official logo files and approved company copy are not supplied.
- Do not publish externally, create paid resources, or populate fabricated contact details.
- No public pricing or ecommerce checkout requested.

## Delegation

- Main agent: requirements, integration, visual direction, implementation coordination and verification.
- Reference research agent: read-only competitor structure and content workflow research.
- Data/handoff agent: read-only persistence, authentication and handoff architecture review.
- Main agent now owns implementation. A bounded independent security review of the foundation has run; findings are being fixed and tested. Final visual and complete product review remain outstanding.

## Latest confirmed design update

The owner explicitly removed the 3D tank requirement. Use the eight supplied customer photographs, a decorative generated banner background, concise sales copy and justified paragraphs with natural heading wrapping. This replaces earlier 3D requirements in this document.
