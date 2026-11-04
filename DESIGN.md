# Current homepage motion direction — 2026-11-04

This section supersedes the earlier homepage hero/carousel notes below. The public identity stays forest green, lime, warm paper and self-hosted Be Vietnam Pro; the homepage now uses a photographic installation stage and a sequence of different spatial transitions.

- `cinematic-hero.tsx` / `cinematic.css`: dominant Composite headline (80–160px desktop, 48–68px phone), 40–68px companion line with balanced natural wrapping; no nonbreaking spaces. Cream/forest support colors preserve the existing identity. The oversized rounded corner is a photographic aperture, not a fake product silhouette.
- New real customer assets live in `public/images/products-2026`, with provenance and explicit mappings in `customer-product-assets.ts`. Hero, bridge, fit, gallery, contact and footer each use a distinct source. CMS covers retain priority. Unconfirmed product families use specifications rather than a mislabelled workshop image.
- Desktop hero pins for 650px when width is at least961px and height at least680px. Six alternating shutters reveal one real photograph; MorphSVG changes its curved aperture into a full-width image. Headings/CTAs exit and an installation caption appears. Phones read in normal flow with CTAs before the photograph.
- WorkshopStory adds a separate560px scene on viewports at least1000x680: three distinct photographs spread from a stack into separated frames. Final scale .49 and three-degree outer rotations keep every caption uncovered. Its native dialog supports previous/next, arrow keys, Escape and focus restoration.
- Lime company statement reveals by phrase; bridge opens a rounded aperture; product selection changes the photograph through a mask; gallery images settle from different depths; a line traces the five-step process; footer lettering rises through its frame.
- GSAP uses matchMedia with reduced-motion fallback, reverts on route changes, and does not smooth-scroll or trap wheel input. Text and photographs are present without JavaScript. Navigation and inquiry logic remain intact.
- Palette additions are intentional tonal variants: stage #063e38, paper #f3f2e9, signal #d3f56b. Editorial image apertures may exceed component radii; ordinary UI remains compact.
- Reference observations: `.impeccable/motion-reference.md`. Content review: `.impeccable/marketing-redesign.md`. No external reference imagery was copied.

---

---
name: Thanh Loi Composite
description: Saturated teal, forest and lime public website with real product photography
colors:
  primary: "#187447"
  public-primary: "#16714e"
  public-ink: "#113d4c"
  public-secondary-text: "#44636b"
  public-surface: "#f5f5ed"
  public-line: "#cfddd5"
  public-navy: "#103e4b"
  public-sage: "#c6dfb5"
  landing-teal: "#063c3b"
  landing-forest: "#123d2c"
  landing-lime: "#d3f56b"
  landing-surface: "#eaf0dc"
  footer-navy: "#082b3e"
  navy: "#103b50"
  navy-deep: "#082a3b"
  ink: "#153b4b"
  secondary-text: "#315a69"
  paper: "#f5f6f0"
  white: "#ffffff"
  line: "#d5dfd9"
  danger: "#a32c24"
  primary-hover: "#105a35"
typography:
  display:
    fontFamily: "Be Vietnam Pro, sans-serif"
    fontSize: "clamp(40px, 4.2vw, 62px)"
    fontWeight: 700
    lineHeight: 1.18
    letterSpacing: "-0.035em"
  public-body:
    fontFamily: "Be Vietnam Pro, sans-serif"
    fontSize: "15px"
    fontWeight: 400
    lineHeight: 1.75
  body:
    fontFamily: "Be Vietnam Pro, sans-serif"
    fontSize: "15px"
    fontWeight: 400
    lineHeight: 1.7
rounded:
  button: "5px"
  input: "5px"
  form: "8px"
  public-card: "16px"
  public-button: "9px"
  public-input: "7px"
  hero-frame: "24px"
  admin-panel: "12px"
spacing:
  small: "16px"
  medium: "32px"
  section: "80px"
components:
  public-button:
    backgroundColor: "{colors.public-primary}"
    textColor: "{colors.white}"
    rounded: "{rounded.public-button}"
    padding: "16px 24px"
  public-card:
    backgroundColor: "{colors.white}"
    rounded: "{rounded.public-card}"
  button-primary:
    backgroundColor: "{colors.primary}"
    textColor: "{colors.white}"
    rounded: "{rounded.button}"
    padding: "16px 24px"
  button-primary-hover:
    backgroundColor: "{colors.primary-hover}"
  input:
    backgroundColor: "{colors.white}"
    textColor: "{colors.ink}"
    rounded: "{rounded.input}"
    padding: "12px 14px"
  admin-panel:
    backgroundColor: "{colors.white}"
    rounded: "{rounded.admin-panel}"
    padding: "32px"
---


## Overview

A consistent corporate website built around saturated navy-to-teal introductory surfaces, forest bands, lime accents, pale green transitions and real customer photographs. The homepage presents the complete seven-product range through native disclosures beside one shared workshop photograph; catalogue cards remain on catalogue and related-product surfaces. The same visual system covers the home, catalogue, product detail, introduction, news, article and contact pages. The existing CMS retains its established tokens and task-oriented layout.

## Colors

Public-scoped tokens distinguish the updated public palette from the preserved shared/admin palette. Green marks consultation actions; navy and teal support introductory and specification bands. The current homepage uses landing-scoped saturated teal, forest, lime and pale surface tokens; the shared public sage/cream palette remains available on other surfaces. Lime highlights the hero strip, light actions, dimension underlines and footer signature. The fiberglass background is decorative, including on specification-led product cards; it is not product evidence.

## Typography

Self-hosted Be Vietnam Pro throughout. Public headings use natural wrapping with -0.035em tracking. Hero display has its own size and line height; other public page headings use clamp(36px, 4.1vw, 60px) with 1.25 line height. Paragraphs justify with the final line aligned left. The two-line footer brand signature uses clamp(52px, 6.7vw, 96px), weight 700, 1.08 line height and -0.04em tracking on desktop. No forced prose line breaks, nonbreaking-space binding or balanced wrapping. The former outlined COMPOSITE word is hidden in the current public design.

## Layout

Public containers have a 1280px maximum width, with 48px desktop gutters, 32px at 1100px, 20px at 800px and 18px at 520px. Sections use 80px vertical spacing, reduced to 52px at 800px. The hero stacks at 800px; catalogue cards move from three columns to two at 800px and one at 520px. The homepage explorer pairs a sticky workshop photo with seven disclosures; it stacks at 800px and the photo returns to normal flow. The five-step ordering section similarly uses a sticky desktop introduction and normal mobile flow. A full-width photo bridge separates product discovery from specifications. News combines a list and sidebar on desktop, stacking at 800px. The header switches to a collapsible menu at 960px. The CMS retains its 240px sidebar, 1440px content maximum and 700px mobile navigation breakpoint.

## Elevation & Depth

Public cards use restrained shadows and vertical hover movement. The main hero photograph sits level in a rounded cream frame; only its smaller overlapping detail photograph retains a 5-degree rotation. Gallery photographs are level, staggered vertically and presented in rounded cards. Dark translucent caption gradients maintain readable text. CMS panels remain bordered and shadow-free. The scroll-linked photo bridge expands only its visual layer; overlay text remains outside the mask. Woven-line tracing and tilted gallery frames from the previous landing design are no longer the public system.

## Shapes

Public product, gallery, news, empty-state and consultation cards share the public-card radius. Buttons and form fields use their public-specific radii. The desktop hero frame uses its larger radius, reduced to 18px on small phones. Product-detail and introduction photographs use 18px corners. The workshop section has 48px upper corners, reduced to 28px on tablet. The footer workshop photograph uses 16px corners with an 80px upper-right corner, reduced to 48px at 800px. The CMS keeps its original button, field, form and panel radii.

## Components

The white header contains route links, an independently controlled product submenu and a consultation action. Active links use green plus an underline. Escape closes the active menu and restores focus; outside interaction closes navigation. Public focus uses a 3px amber outline with a 5px offset, while header links/buttons use a 2px green outline with a 4px offset. Shared/admin focus remains unchanged.

The homepage ProductExplorer renders all supplied products (currently seven) as native details sharing the product-choice group name, with the first open initially. Each disclosure contains its description, specification list and detail link; its plus icon rotates when open. The shared customer-03 workshop photograph represents the range without implying a product-photo mapping. Disclosure remains usable without JavaScript.

Catalogue and related-product cards use the CMS cover image only when assigned. Without a cover, show the category and first specification over a decorative material gradient. An unassigned product detail photograph is explicitly captioned as a general workshop view. Never infer a product-photo mapping. News uses published records, optional cover images, filters, pagination and honest empty states. Missing company phone/email remain absent; the contact page uses Phu Tho as its location fallback. Confirm company contact details, publish approved articles and map real photos to products through the CMS before treating those content gaps as resolved.

The five-step ordering process and transport requirements come from the supplied Thanh Loi Word document. Unconfirmed warranties and project metrics remain excluded.

The hero retains three real photographs, manual thumbnails and six-second automatic cycling. Hover, focus, offscreen state, hidden tabs, reduced motion or manual thumbnail selection stop cycling. A manual pause requires explicit resume. The current photo crossfades over 800ms. The initial photograph and page content remain visible without JavaScript.

Shared publicChoreography in src/lib/public-choreography.js powers React and the static presentation with GSAP and ScrollTrigger. The hero sequence uses 1350ms expo.out timing: the heading rises, the photo frame opens from an inset mask and settles from a small scale/rotation, then actions and notes enter. The photo bridge mask expands with 0.7s scrub between top 85% and top 15%; the photo itself scales from 1.18 to 1 and moves from -5% to 5% with 0.8s scrub. Bridge copy enters once, independently of the image mask.

Marked elements reveal once at top 88% over 1000ms; the fit photograph uses a horizontal mask while other elements rise 36px. Dimensions stagger by 100ms over 650ms with back.out(1.5). Ordering steps enter sequentially over 800ms, with a smaller horizontal movement on mobile. Opening an explorer disclosure reveals its content over 450ms and schedules ScrollTrigger refresh after 400ms so later scenes follow its new height.

The footer closes the consultation surface in dark navy with a large lime two-line brand link, real workshop photograph, consultation action, navigation and confirmed company details. Its signature lines rise and settle once at top 95%, over 1250ms with 130ms stagger. MatchMedia skips choreography for reduced-motion users and reverts it on cleanup or preference changes. Content is visible by default. CSS disables transitions and hover movement for reduced motion; native disclosure expansion animates only where interpolate-size is supported. CMS behavior is unchanged.

## Do's and Don'ts

- Use supplied real photographs and verified dimensions.
- Keep shared/admin tokens separate from public-scoped overrides.
- Use data-led material cards when a product cover is unassigned.
- Preserve accessible navigation, visible focus and reduced-motion behavior.
- Do not invent company contacts, articles, projects, certifications or guarantees.
- Do not infer which application a photographed tank serves without confirmation.
