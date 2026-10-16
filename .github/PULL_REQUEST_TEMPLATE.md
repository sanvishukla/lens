## What changed

## Accessibility checklist (Lens must pass its own audit)

- [ ] Works with keyboard only (visible focus, logical order, no traps)
- [ ] Tested with a screen reader (NVDA, VoiceOver, or TalkBack) for new UI
- [ ] Text contrast meets WCAG AA in light and dark themes
- [ ] Usable at 400% zoom / 320 px width
- [ ] Respects `prefers-reduced-motion`
- [ ] AI output is labeled as a draft and needs a human decision

## ML changes (if any)

- [ ] New datasets are listed in `ml/data/licenses.yaml`
- [ ] `python ml/scripts/check_licenses.py` passes for affected configs
