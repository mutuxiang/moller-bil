# Vehicle follow-up verification

Run `node tests/vehicle-followups.cjs` and `node tests/inventory-flow.cjs`.

- Selecting a model or listing places its reference outside the message box, replacing quick replies.
- A single reference proposes a question. Two or more propose “Help me compare them”; Send uses this question when the draft is empty.
- Added toggles selection off. Removing the last reference restores quick replies and the default placeholder.
- Two reference cards share a row. Three or more retain that width and scroll horizontally.
- Comparison uses inventory facts in the right dock and a concise assistant message. Price/mileage favour lower values; year/range favour higher values. Missing figures, ties and preference fields receive no marker.
- Mixed model/listing prices are not ranked; representative data is explicitly labelled.
- Comparison is capped by the measured fuel card and available dock height, with table scrolling when needed.
- Saved-car actions share the same brand pill styling. Stock stays on one row with Back and page controls together.
- Vehicle context never changes shopping filters. Ordinary chat still updates them.

Browser preview uses `127.0.0.1:8766` with the system proxy unchanged.
