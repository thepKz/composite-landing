# Website image sources

- `customer-originals/`: eight original images supplied by the customer in two ZIP archives. `sources.json` maps each file to its archive and entry.
- `public/images/customer/`: WebP exports, maximum 1800 px wide, quality 88. `customer-04-detail.webp` is a tighter crop for the specification section; the complete photograph remains available in the gallery.
- `public/images/material-background.webp`: AI-generated decorative fiberglass backdrop using the user's local image service and model `cx/gpt-5.6-sol-image`. Exact prompt: `material-background.prompt.txt`. This image does not represent a real product or factory.
- `public/images/thanh-loi-logo.png`: cropped from the supplied brand image.

Product photos retain their original subject matter. Captions do not infer a technical application from appearance. The homepage uses static asset paths; these placements are not currently editable in the CMS.

All eight customer images have also been imported into the admin media library with stable IDs, so they can be reused in posts and product covers.
