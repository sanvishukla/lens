# M7: Vague link and button text classifier

Flags names like "click here" or "read more" that don't make sense out of context.

- Base: ModernBERT-base or MiniLM (Apache-2.0).
- Data: accessible names from `lens_synthetic` pages with LLM-assisted, human-verified labels.
- Deploy: browser.
- Ship gate: F1 ≥ 0.85.
