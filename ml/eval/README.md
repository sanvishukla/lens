# eval/

Held-out sets and scoring scripts. Every model gets compared against the prompted baseline it would replace.

- Keep eval splits out of training (the license checker can't catch leakage; dedupe by URL/image hash).
- Report human acceptance rate from `suggestions` alongside automatic metrics (CIDEr, SARI, WER, mAP).
