# Vehicle follow-up verification

Run `node tests/vehicle-followups.cjs` and `node tests/inventory-flow.cjs`.

- Selecting a model or listing places its reference outside the message box, replacing quick replies.
- A single reference proposes a question. Two or more propose “Help me compare them”; Send uses this question when the draft is empty.
- Added toggles selection off. Removing the last reference restores quick replies and the default placeholder.
- Two reference cards share a row. Three or more retain that width and scroll horizontally.
- Comparison uses inventory facts in the right dock and a concise assistant message. Price/mileage favour lower values; year/range favour higher values. Missing figures, ties and preference fields receive no marker.
- Mixed model/listing prices are not ranked; representative data is explicitly labelled.
- Comparison shows only price, mileage and electric range, with larger vehicle images. Fuel and comparison share the same dock row proportions, so switching does not move inventory. The card stays capped by the fuel card and available dock height, with internal scrolling when needed.
- Saved-car actions share one row in the wider drawer; images use contain instead of crop. Stock stays on one row. Back sits beside the Inventory label while pagination stays at the far edge.
- Vehicle context never changes shopping filters. Ordinary chat still updates them.

Browser preview uses `127.0.0.1:8766` with the system proxy unchanged.
