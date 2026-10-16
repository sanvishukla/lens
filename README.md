# Lens

Put your site through glass. Paste a URL or HTML and Lens:

- audits it against WCAG 2.2 (axe-core plus Lens rules for focus, keyboard traps, reflow, target size),
- lets you **hear** it in screen-reader order, **see** it with color vision deficiencies, blur, and low contrast, and **trace** the keyboard path,
- drafts fixes (alt text, labels, code patches) that you accept, edit, or reject.

Free, open source (MIT), and runs on free tiers. Product spec: [PRD.md](PRD.md).

## Repository layout

```
apps/
  web/          Next.js 16 site: scan form, report lenses, AI fix API
  worker/       Playwright scanner that pulls jobs from the Supabase queue
  extension/    (later) browser extension
packages/
  core/         shared report schema, WCAG mapping, contrast and color-vision math
  cli/          (later) CI command line
supabase/       migrations and local config
ml/             license allowlist, training configs, and notes for future models
content/        (later) pattern library and lived-experience writing
```

## Try the UI without any setup

```bash
npm install
npm run dev --workspace @lens/web
```

Open http://localhost:3000/r/demo for a full example report with sample data. No database or AI key needed.

## Getting started

Needs Node 24+, Docker (for local Supabase), and optionally Python 3.12 for `ml/`.

```bash
npm install
cp .env.example .env            # fill in Supabase and AI provider keys
npx supabase start              # local Postgres, Auth, Storage
npx supabase db reset           # applies supabase/migrations
npx playwright install chromium # once, for the worker
npm run dev                     # web on :3000, worker on :7860
```

Get a free AI key from [Groq](https://console.groq.com) or [Google AI Studio](https://aistudio.google.com),
or run `docker compose --profile local-ai up ollama` to keep everything on your machine.

## What works in this phase

| Area | Status |
| --- | --- |
| URL and HTML scans, axe + Lens rules | Implemented |
| Screen reader, vision, keyboard, target lenses | Implemented |
| AI suggestions with accept/edit/reject | Implemented |
| WCAG retrieval corpus ingest | Stub (`apps/web/scripts/ingest-wcag.ts`) |
| Screenshot-only scans, extension, CLI, trained models | Later phases |

## Checks

```bash
npm run typecheck
npm test
python ml/scripts/check_licenses.py ml/configs/*.yaml

# Lens's own UI: start the app first, then
npm run a11y --workspace @lens/web
```

`npm run a11y` runs axe (WCAG 2.2 AA) on every page in light and dark mode at 1280px and 320px,
checks for sideways scrolling, and walks the keyboard flows. CI fails if any of it regresses.
See the [accessibility statement](apps/web/src/app/accessibility/page.tsx) for what we commit to.

Automated checks find a fraction of accessibility problems. Lens is not a compliance certificate and
never injects an overlay into your site.
