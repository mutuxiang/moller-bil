# Vehicle follow-up verification

Run `node tests/vehicle-followups.cjs` and `node tests/inventory-flow.cjs`.

- Selecting a model or listing places its reference outside the message box, replacing quick replies.
- A single reference proposes a question. Two or more propose “Help me compare them”; Send uses this question when the draft is empty.
- Added toggles selection off. Removing the last reference restores quick replies and the default placeholder.
- Two reference cards share a row without hiding the subtitle. Three or more retain that width and scroll horizontally.
- Comparison uses inventory facts in the right dock and a concise assistant message. Price/mileage favour lower values; year/range favour higher values. Missing figures, ties and preference fields receive no marker.
- Mixed model/listing prices are not ranked; representative data is explicitly labelled.
- Comparison shows only price, mileage and electric range, with larger vehicle images. Fuel and comparison share the same dock row proportions, so switching does not move inventory. Both card types use the same 412px height. Fuel contents fit inside that height; all five fuel cards stay visible without horizontal scrolling.
- Saved-car actions share one row in the wider drawer; images use contain instead of crop. Stock stays on one row. Back replaces the Inventory eyebrow with the same typography and colour, while pagination stays at the far edge.
- Vehicle context never changes shopping filters. Ordinary chat still updates them.

Browser preview uses `127.0.0.1:8766` with the system proxy unchanged.

## Dock alignment and comparison refinement

- Verify a single visible Side-by-side comparison heading, larger uncropped photos, three metrics, and complete content within the shared 412px visualization card.
- At 1536×1100, compare recommendation and inventory card heights and bottom bounds against the chat composer before and after See all in stock; verify the return arrow and pagination.
- Check welcome content stays separated from the image cluster at 1280×720, and hybrid plus remains spaced from both icons.
- Local preview forwards API requests through Windows networking so an active system proxy is respected.

- Welcome polish: enlarged typewriter text, shorter and lower CTAs, hero images flush with viewport bottom.
- Comparison gallery: two wide 120px-high photos left-aligned with names; no visible vehicle count or representative-listing note; mileage row has the card background. Verify gallery plus three metrics fit the existing 412px card.
- Inventory pagination and model title bottom edges must match, without changing vehicle-card height.

- Shopping-only entry: welcome and chat Just learning controls are disabled; direct entry requests and learning phrases cannot switch the application mode. Run `node tests/shopping-entry.cjs`.
- Comparison images, titles, advantage callouts and corresponding vehicle values share a left edge; metric labels occupy the separate first column. Return and pagination arrow SVGs must all measure 18×18px.

- Compact spacing: no inherited 36px top padding on recommendations, shared 74px recommendation/inventory header, 220px vehicle body, and 412px shared visualization height. Advantages use the exact Why this one background with no border. Check card bottom alignment and inventory switching still hold.
