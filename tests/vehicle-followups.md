# Vehicle follow-ups

Live recommendation model cards and inventory vehicle cards now support **Add to chat**.
Selected models/listings appear as removable chips in the composer. Quick reply becomes
Quick follow-up with suitability, running cost, buying checks, and details/comparison prompts.
Selections remain available for subsequent questions and are cleared by starting a new chat.
Model references intentionally omit the representative listing's specifications. Individual
listing references carry the listing ID and available specifications. Neither modifies shopping filters.

## Validation

Run `node tests/vehicle-followups.cjs` (no dependencies).
Checks script syntax, duplicate prevention, model/listing distinction, follow-up switching,
removal, serialized API context, preference-filter isolation, and ordinary chat behavior.
The assistant is stubbed: this does not verify live model answers or inventory availability.

Manual acceptance: add a model, open its inventory and add a listing, ask a comparison,
remove both chips, and start a new chat. Check keyboard operation and narrow screens.
Browser visual verification was not completed because the local preview connection timed out.

## Version management

Feature branch: `codex/vehicle-chat-followups`.
The change is isolated in a commit; revert that commit to roll it back.
