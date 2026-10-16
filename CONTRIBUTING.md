# Contributing to Lens

Thanks for helping. People who use a screen reader, a keyboard, a switch, or zoom every day are especially welcome.

## Before you open a PR

- `npm run typecheck` and `npm test` pass.
- `npm run a11y --workspace @lens/web` passes against a running app.
- Never remove focus from an element without moving it somewhere sensible, and announce async results with `role="status"`.
- UI changes work with a keyboard alone and have visible focus.
- New UI has been tried with a screen reader (NVDA, VoiceOver, or TalkBack) and at 200% zoom.
- Scan a page you changed with Lens itself.

## Machine learning

- Add any new dataset to `ml/data/licenses.yaml` with its license source before using it.
- `python ml/scripts/check_licenses.py ml/configs/*.yaml` must pass.
- Don't add base models with non-commercial or AGPL licenses.

## Language

Describe the barrier and the way of using the page, not a medical category: "the button has no name" rather than "this breaks for X users".
Never claim a page is "accessible" or "compliant" based on automated results.
