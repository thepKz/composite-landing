# Landing redesign audit - 2026-11-04

## Requirements and evidence

- Read session mr Dung DN in research; inspected its IMMERSIVE-STORYBOARD.md in LANDING_CODUNG. Only visual lessons transfer, no AZ FACE business facts.
- Reference researcher observed https://aperios-design.co.uk/ through https://www.footer.design/sites/aperios-design: moving oversized wordmark with static navigation. Observed https://www.contentarchitecture.dev/ through https://www.footer.design/sites/the-content-architecture: animated graphic zone above stable footer. Our finite reveal is an adaptation, not their exact animation.
- Current composition: saturated teal/forest/lime, seven native product disclosures beside a real workshop photo, photo bridge into specifications, gallery, five-step process, FAQ, contact, photographic signature footer. Screenshot: .impeccable/review/landing-final-desktop.png.
- Varied GSAP choreography: hero frame opening, scroll-linked image expansion/parallax, dimension stagger, sequential process, disclosure transitions and footer signature reveal. Same source powers React and static export.
- Word content: five-step ordering process, chemical parameters and vehicle/aquaculture transport requirements. Unconfirmed contacts, warranties, conflicting timings and illustrative projects excluded.
- Team: reference research, source reviews, separate screenshot review and DESIGN.md documenter completed. Final reviewer found no visual blocker in fullpage desktop, explorer and mobile footer.

## Verification

Build and TypeScript passed after final code changes. Browser widths360/390/768/1440 had no horizontal overflow. Accordion mouse and Enter activation selected one item. Desktop photo sticky observed. Reduced-motion emulation reverted bridge clip-path and footer transforms to none. With JavaScript disabled, native disclosure still opened and demo form remained disabled. Emulation settings restored.

Static detail dialog showed selected Be phot product. No failed loaded images. App console inspection found no errors. Export asset audit resolved15 HTML assets and11 CSS resource occurrences; seven disclosures; no localhost or Next asset references. ZIP rebuilt. No external deployment. Demo form submits/stores nothing; admin/backend excluded.

## Limits

Screenshots establish composition, not device-wide frame-rate guarantees. No company facts were independently verified. Existing CMS remains intact. Relevant files changed: homepage, ProductExplorer, shared public CSS, choreography/wrapper, footer, demo controller/exporter and docs. No database, admin business logic or dependency changes in these passes.
