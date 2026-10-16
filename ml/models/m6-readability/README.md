# M6: Readability scorer and simplifier

- Base: scorer ModernBERT-base (Apache-2.0); simplifier Qwen2.5-0.5B/1.5B-Instruct (Apache-2.0).
- Data: `onestopenglish`, `wikilarge_clean` (both share-alike, so weights are CC BY-SA 4.0). `asset` is eval only (NC).
- Deploy: browser (scorer), server (simplifier).
- Ship gate: SARI at least matches the prompted baseline on ASSET; meaning preserved in ≥ 90% of human checks.
