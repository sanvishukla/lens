# M3: Context-aware alt text and decorative classifier

- Base: SmolVLM-500M (Apache-2.0) or Florence-2-large (MIT).
- Data: `concadia` (marked research until filtered to images whose Commons license allows reuse), `lens_feedback` from verified sites only.
- Deploy: browser for 500M, server for larger.
- Ship gate: blind reviewers prefer it at least as often as the prompted baseline; hallucination rate under 5%.
- Never infer identity, race, gender, age, or disability.
