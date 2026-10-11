# Vehicle follow-ups and inventory layout

Live model recommendations and individual inventory cars support **+ Ask about**.
Selected vehicles appear in the composer as removable references with a thumbnail,
model/year, specifications and price. Model-level references label the representative
listing and starting price; only the model identity enters the AI context.
Quick follow-up offers suitability, running cost, buying checks and details/comparison.

The inventory grid uses content-sized rows and automatic card height. Percentage
heights previously collapsed hundreds of inventory cards to zero height inside the
scrolling flex layout. Errors remain visible, and late requests cannot overwrite a
newer model or the restored recommendations.

## Validation

- `node tests/vehicle-followups.cjs`: syntax, duplicate prevention, model/listing
  distinction, follow-ups, removal, API context, filter isolation and ordinary chat.
- `node tests/inventory-flow.cjs`: open/reopen, visible errors, cancellation and
  rapid model switching. These tests stub the DOM and assistant; browser layout
  is verified separately.
- Local browser with proxy enabled: Volkswagen ID.4 inventory rendered 298 cards
  at positive heights; Audi Q4 e-tron rendered 205 with no collapsed cards.
  Inventory references, return to recommendations and reopening were exercised.

See `scripts/README.md` for the persistent local preview command.

## Version management

Initial feature: `codex/vehicle-chat-followups`, commit `4173a86`.
Inventory/reference UI fix: `codex/inventory-followup-layout`.
Each change is isolated in Git and can be reverted independently.

## Comparison and carousel update

Branch: `codex/vehicle-comparison-carousel`.

- Two composer references share one row; additional references keep the same
  width and scroll horizontally. Browser measured 228.4px for both two and three
  selections at the test viewport; the third extends the scrollable rail.
- Two-car comparison displays a two-column specification table in the visualization
  area when the comparison quick follow-up is selected or a comparison is sent.
  Listing facts and model representative-listing facts are clearly distinguished;
  unknown values show Not provided. Difference rows use the existing surface color.
- Original Why this one reason styling is restored. Added uses a stroked SVG check.
- Saved cars retain listing reference data and offer Ask about alongside View details.
  Browser verified closing the drawer, restoring composer focus and adding the listing.
- Inventory renders one page of up to three cars in a single row, with previous/next
  controls and an item range. Browser verified 1–3 → 4–6 → 1–3 and saving a listing.
  Automated tests cover first/last page boundaries and reopening at page one.

## Compact control update

Branch: `codex/compact-vehicle-card-controls`.
Ask about/Added sits beside the vehicle name; pressing it again removes the reference
and restores ordinary quick replies when the final vehicle is deselected. The extra
button row is removed. Source image geometry is captured when selecting or saving
so composer thumbnails share the source card's image ratio (browser checked ~1.14
for both). Inventory previous/page/next controls share the Back to recommendations
row, with page numbers only. Tests cover deselection/reselection and page boundaries.
