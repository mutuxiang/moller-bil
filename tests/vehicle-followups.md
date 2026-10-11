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
