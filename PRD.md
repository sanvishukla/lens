# Lens — Product Requirements Document

**Working name:** Lens (rename before launch; "Google Lens" collision)
**Owner:** Sanvi
**Status:** Draft v0.1 — 13 Oct 2026
**License:** MIT (code), model weights per-model (see §9)
**Hosting:** `<your-domain>.tech`, free tiers only

---

## 1. Summary

Lens is a free, open-source website where anyone can paste a URL (or upload a screenshot) and:

1. **Audit** it against WCAG 2.2 with automated checks.
2. **Experience** the page through accessibility lenses: screen-reader order and audio, keyboard-only navigation, color-vision deficiencies, low vision, zoom/reflow, motor and cognitive load.
3. **Fix** it with AI-drafted suggestions (alt text, labels, contrast-safe colors, code patches) that a human reviews before use.
4. **Share** a report link or export it to an issue tracker.

Lens is for the people who build interfaces: designers, frontend developers, students, and UX/HCI researchers.

## 2. Problem

- Existing checkers (axe, WAVE, Lighthouse, IBM Equal Access) produce rule lists. Designers and students struggle to turn "`button-name`: Buttons must have discernible text" into an understanding of what a user actually experiences.
- Simulators (NoCoffee, Funkify, Chrome DevTools vision emulation) are scattered across extensions and DevTools panels, with no connection to the audit.
- Fix guidance is generic. Nobody writes the alt text, the label, or the patched component for you.
- Screenshot- and Figma-stage designs can't be audited at all by DOM-based tools, which is exactly when fixes are cheapest.
- Legal pressure is rising (European Accessibility Act in force since June 2025; ADA Title II web rule in the US), and many small teams and students have no budget for paid tools.

## 3. Users

| Persona | Context | Job to be done |
|---|---|---|
| **Priya, frontend dev** | Ships React apps at a startup, no accessibility specialist | "Tell me what's broken on this page and give me a patch I can paste." |
| **Marco, product designer** | Works in Figma, rarely touches code | "Check my mockup before handoff, and help me explain to my team why it matters." |
| **Aisha, HCI/UX student** | Course project or thesis | "Audit my prototype, learn the WCAG reasoning, cite a report in my writeup." |
| **Dev, OSS maintainer** | Maintains a docs site | "Run this in CI and comment on PRs that regress accessibility." |
| **Lena, accessibility advocate / instructor** | Teaches workshops | "Show a room full of people what a broken page sounds like with a screen reader." |

People with disabilities are **not** the primary end users of Lens (they are the users of the sites Lens improves). They **are** essential contributors: co-designers, testers, and authors of the "lived experience" content (§6.9).

## 4. Goals and non-goals

### Goals
- G1: A stranger can go from landing page to first useful audit in under 60 seconds, without an account.
- G2: Every finding is explained in plain language, with how it affects specific people and a concrete fix.
- G3: AI suggestions are always reviewable, editable, and labeled as AI drafts.
- G4: Runs entirely on free tiers and can be self-hosted with one `docker compose up`.
- G5: Lens itself meets WCAG 2.2 AA (we dogfood it on every deploy).

### Non-goals
- **Not a compliance certificate.** Lens never says a site is "compliant" or "accessible." Automated checks miss many real barriers; the UI says so on every report.
- **Not an accessibility overlay.** Lens will never ship a JavaScript widget that "fixes" sites at runtime. The disabled community widely rejects overlays; Lens fixes source code and designs.
- Not a full manual-audit workflow (VPAT authoring, enterprise audit management) in year one.
- Not a native mobile-app scanner in year one (web and screenshots only).

## 5. Success metrics (12 months)

| Metric | Target |
|---|---|
| Weekly active users (ran ≥1 scan) | 500 |
| Median time to first result (URL scan) | < 30 s |
| AI suggestion acceptance rate (accepted as-is or with light edits) | ≥ 50 % |
| Shared report links created | 1,000 total |
| GitHub stars / external contributors | 500 / 10 |
| Lens' own axe + manual audit | 0 serious/critical issues |
| Uptime of hosted app | ≥ 99 % (free-tier realistic) |

---

## 6. Features

Priority: **P0** = MVP (launch), **P1** = v1.0, **P2** = later.

### 6.1 Scan (input)

| ID | Feature | Priority | Requirements / acceptance criteria |
|---|---|---|---|
| S1 | **URL scan** | P0 | Paste a public URL; a headless browser renders it at desktop and 375 px mobile widths; results in < 30 s for a median page. Blocks private/internal IPs (SSRF protection). Respects `robots.txt` opt-out. Rate-limited per IP. |
| S2 | **HTML paste** | P0 | Paste an HTML snippet or component; scanned in a sandboxed iframe. For students and component-level checks. |
| S3 | **Screenshot / image upload** | P1 | Upload PNG/JPG (or Figma export). Vision models (§8, M1–M3) detect elements and flag likely issues (contrast, missing labels, tiny targets). Results are marked "visual estimate." |
| S4 | **Browser extension** | P1 | Chrome/Firefox (MV3) runs the same checks inside the user's tab, so logged-in, localhost, and staging pages work. No page content leaves the browser unless the user saves a report. |
| S5 | **Multi-page crawl** | P2 | Scan up to 20 linked pages on the same domain (logged-in users only). |
| S6 | **Figma plugin** | P2 | Run screenshot-mode checks on frames directly in Figma. |

### 6.2 Audit engine

| ID | Feature | Priority | Requirements |
|---|---|---|---|
| A1 | **Rule engine** | P0 | `axe-core` (MPL-2.0) as primary; optional IBM Equal Access (Apache-2.0) as second opinion. Results mapped to WCAG 2.2 success criteria and level (A/AA/AAA). |
| A2 | **Extra checks** | P0 | Target size (WCAG 2.5.8), reflow at 320 CSS px (1.4.10), text spacing override (1.4.12), focus visible (2.4.7), `prefers-reduced-motion` respected, page language, heading outline. |
| A3 | **Contrast** | P0 | WCAG 2.x ratio for every text node against its rendered background (pixel-sampled, so it works on images and gradients). APCA shown as an informational second score. |
| A4 | **Severity and grouping** | P0 | Group by impact (critical → minor) and by affected group (blind, low vision, keyboard, cognitive, deaf/HoH). Deduplicate repeated components ("this card appears 24 times"). |
| A5 | **Manual-check prompts** | P1 | For things machines can't verify (meaningful alt text, logical focus order in complex widgets), give a short guided checklist the user ticks off. Recorded in the report. |
| A6 | **Score history** | P1 | Logged-in users see trends for the same URL over time. |

### 6.3 Screen reader lens (speech)

| ID | Feature | Priority | Requirements |
|---|---|---|---|
| SR1 | **Reading order view** | P0 | Linearized list of what a screen reader announces, built from the browser accessibility tree (role, name, state). Problems inline: "Button, unlabeled", "Image" with no name, skipped heading levels. |
| SR2 | **Listen mode** | P0 | Plays the reading order aloud with TTS (browser `speechSynthesis`; Kokoro-82M in-browser as the higher-quality option), with highlights on the page as it reads. |
| SR3 | **Landmarks and headings rotor** | P1 | Mimics screen-reader rotors: jump by headings, landmarks, links, form fields. Shows "links out of context" (e.g., five links all named "Read more"). |
| SR4 | **Compare with a real screen reader** | P2 | Documentation and short recordings (made with blind contributors) of NVDA/VoiceOver on the same patterns. Sets expectations that Lens's audio is an approximation. |

### 6.4 Vision lenses

| ID | Feature | Priority | Requirements |
|---|---|---|---|
| V1 | **Color-vision deficiency** | P0 | Protanopia, deuteranopia, tritanopia, achromatopsia, plus anomalous variants at adjustable severity (Machado et al. 2009 matrices, applied on the GPU). Side-by-side with the original. |
| V2 | **Low vision** | P0 | Blur (acuity), contrast loss, central scotoma, peripheral loss (tunnel), glare. Severity slider. |
| V3 | **Zoom / reflow** | P0 | 200 % and 400 % zoom render; flag horizontal scroll, clipped text, overlapping elements. |
| V4 | **Color-safe palette fixer** | P1 | For each contrast failure, propose the nearest colors in the same hue that pass AA, with a preview. Exportable as CSS variables / design tokens. |
| V5 | **Forced colors / high contrast** | P1 | Render with `forced-colors: active` and flag icons or focus indicators that disappear. |

### 6.5 Motor and keyboard lenses

| ID | Feature | Priority | Requirements |
|---|---|---|---|
| K1 | **Keyboard path** | P0 | Animated tab order overlaid on the page; flags unreachable interactive elements, focus traps, missing visible focus, and illogical jumps. |
| K2 | **Target size map** | P0 | Heatmap of interactive targets below 24×24 CSS px and spacing violations. |
| K3 | **Tremor / imprecise pointer** | P1 | Interactive demo where the pointer jitters; shows which targets become hard to hit. |
| K4 | **Voice-control names** | P2 | Checks that visible labels match accessible names (WCAG 2.5.3), so "click Submit" works with voice control. |

### 6.6 Text and cognitive lenses

| ID | Feature | Priority | Requirements |
|---|---|---|---|
| T1 | **Readability** | P1 | Reading-level estimate per section (classic formulas plus a learned model, §8 M6). Highlights long sentences, jargon, and walls of text. |
| T2 | **Plain-language rewrite** | P1 | AI rewrite of a selected paragraph at a chosen level, with a diff. Always a suggestion, never auto-applied. |
| T3 | **Link and button text quality** | P1 | Flags vague labels ("click here", "more", "submit") and suggests specific ones (§8 M7). |
| T4 | **Dyslexia / reading-preference preview** | P1 | Preview with increased spacing, line length limits, and fonts like Atkinson Hyperlegible and OpenDyslexic (both OFL). |
| T5 | **Clutter and distraction** | P2 | Flags auto-playing media, motion, carousels, and dense layouts; estimated visual complexity score. |

### 6.7 Media (hearing)

| ID | Feature | Priority | Requirements |
|---|---|---|---|
| H1 | **Media inventory** | P1 | Lists `<video>`, `<audio>`, and embedded players; flags missing captions/transcripts (WCAG 1.2.x). |
| H2 | **Draft captions** | P2 | For media files the user owns and uploads, generate draft WebVTT captions with Whisper; user edits in a caption editor and downloads. |

### 6.8 Fix assistant (AI)

| ID | Feature | Priority | Requirements |
|---|---|---|---|
| F1 | **Explain** | P0 | Every finding has a plain-language explanation: who it affects, how, and the WCAG criterion, grounded in W3C Understanding docs and ACT rules (retrieval, not model memory). |
| F2 | **Alt text drafts** | P0 | For images missing alt text: suggest alt text that uses page context, or recommend `alt=""` if decorative. User accepts, edits, or rejects. |
| F3 | **Label drafts** | P0 | For unlabeled buttons/links/inputs (often icon-only): suggest an accessible name from the icon and context. |
| F4 | **Code patch** | P1 | For a failing element, propose a minimal HTML/JSX patch as a diff. Lens re-runs the rule on the patched snippet and shows "passes axe" or "still fails" before the user sees it. |
| F5 | **Bulk review queue** | P1 | Keyboard-driven queue (accept `A`, edit `E`, reject `R`) for many alt texts and labels at once. Export as JSON/CSV or a patch file. |
| F6 | **Bring your own key** | P1 | Users can paste their own API key or point at a local Ollama endpoint; self-hosters default to local models. |

### 6.9 Learn

| ID | Feature | Priority | Requirements |
|---|---|---|---|
| L1 | **Pattern library** | P1 | Short pages per common issue: what it is, who it affects, before/after code, how to test. CC BY 4.0 content. |
| L2 | **Lived-experience notes** | P1 | Short, paid or credited contributions from disabled users explaining how a barrier affects them. Lens's simulations link here, to counter the known risk that disability simulations misrepresent disability. |
| L3 | **Workshop mode** | P2 | Presenter view for instructors: large text, step through a page with the screen-reader lens and keyboard path. |

### 6.10 Reports and integrations

| ID | Feature | Priority | Requirements |
|---|---|---|---|
| R1 | **Share link** | P0 | Public, unguessable report URL with screenshot, findings, and accepted fixes. Expires after 30 days unless the owner pins it. |
| R2 | **Export** | P0 | Markdown, PDF, JSON (stable schema, versioned). |
| R3 | **GitHub issues** | P1 | One click creates an issue per finding group, with WCAG reference and suggested patch. |
| R4 | **CLI and GitHub Action** | P1 | `npx lens-a11y scan <url>` and an Action that comments on PRs with new/regressed findings. Uses the same engine (no AI by default in CI). |
| R5 | **Public API** | P2 | REST endpoint for scans with API keys and quotas. |

### 6.11 Accounts and workspaces

| ID | Feature | Priority | Requirements |
|---|---|---|---|
| U1 | **Anonymous use** | P0 | Scan, simulate, and share without an account (stricter rate limits). |
| U2 | **Sign in** | P0 | Magic link and GitHub OAuth (Supabase Auth). |
| U3 | **Projects** | P1 | Save URLs, history, accepted fixes; invite teammates. |
| U4 | **Site ownership verification** | P1 | Meta tag or DNS TXT record. Required for crawls (S5) and for opting a site's content into training data (§10). |

---

## 7. User flows

**First visit (no account):** landing page → paste URL → progress (render, audit, lenses) → summary (top 5 issues by impact, affected groups) → open any lens → open a finding → see explanation + AI draft fix → copy fix or share report.

**Designer with a mockup:** upload screenshot → visual estimate with detected elements → contrast and target-size findings → palette fixer → share link with developer.

**Developer in CI:** add GitHub Action → PR comment lists new issues with patches → click through to full report.

---

## 8. AI and model plan

### 8.1 Principles
1. **Rules first, models second.** Anything a deterministic rule can check (contrast math, missing attributes, target size, tab order) is never sent to a model.
2. **Prompt first, fine-tune second.** Launch with prompting of free hosted models. A fine-tuned model ships only if it beats the prompted baseline on our held-out test set.
3. **Small and local when possible.** Prefer models that run in the browser (ONNX via `transformers.js` / `onnxruntime-web`) so screenshots never leave the user's device and hosting stays free.
4. **Human review always.** Model output is a draft; nothing is applied automatically.
5. **Clean licenses.** Only base models and training data with licenses that allow redistribution of an MIT project and its weights (§9).

### 8.2 Phase 0 — launch without training (P0)

| Task | Approach |
|---|---|
| Explanations (F1) | Retrieval over WCAG 2.2, Understanding WCAG, and ACT Rules (W3C license) + a hosted LLM (Groq Llama or Gemini free tier). |
| Alt text and labels (F2, F3) | Hosted vision model with page context in the prompt. |
| Code patches (F4) | Hosted LLM + axe re-check loop. |
| TTS (SR2) | Browser `speechSynthesis`; Kokoro-82M (Apache-2.0) in browser as quality option. |
| Embeddings for retrieval | `all-MiniLM-L6-v2` (Apache-2.0) or `bge-small-en-v1.5` (MIT) in pgvector. |

Phase 0 also builds the **evaluation sets** (§8.4) and the **feedback logging** (§10) that later fine-tunes depend on.

### 8.3 Models to train (future)

| ID | Model | Powers | Base model (license) | Training data (license) | Runs where | Ship gate |
|---|---|---|---|---|---|---|
| **M1** | **UI element detector**: screenshot → bounding boxes + types (button, input, icon, link, text, image) | S3, S6, K2 on screenshots | RT-DETR or RF-DETR (Apache-2.0) | RICO semantic annotations (CC BY 4.0); RICO Semantics human boxes (CC BY-SA 4.0); **synthetic web screenshots** we render from MIT-licensed UI kits with DOM-derived labels (ours) | Browser (ONNX) | mAP@0.5 ≥ 0.6 on our web test set; < 1.5 s in browser on a mid laptop |
| **M2** | **Icon / element namer**: crop + context → accessible name ("Search", "Close menu") | F3, S3 | Florence-2-base 0.23B (MIT) or SmolVLM-256M (Apache-2.0) | Widget Captioning (CC BY 4.0); RICO Semantics icon semantics (CC BY-SA 4.0); RICO icon classes (CC BY 4.0); accepted user labels (ours, opt-in) | Browser (ONNX) | Human-rated "usable as-is" ≥ 70 %, beats prompted baseline |
| **M3** | **Context-aware alt text** + decorative classifier | F2 | SmolVLM-500M (Apache-2.0) or Florence-2-large 0.77B (MIT) | Concadia (Wikipedia images with alt + context; per-image Commons licenses); accepted/edited alt text (ours, opt-in, verified sites only) | Browser for 500M; server for larger | Blind-reviewer preference ≥ prompted baseline; hallucination rate < 5 % on test set |
| **M4** | **Page summary** for the screen-reader intro ("Checkout page with a 3-step form") | SR1 | Same as M2/M3 | Screen2Words (CC BY 4.0) | Browser | Human rating ≥ baseline |
| **M5** | **Accessibility patch model**: (violation + HTML) → patched HTML | F4, R4 | SmolLM3-3B (Apache-2.0) or Qwen2.5-Coder-1.5B-Instruct (Apache-2.0) | AccessGuru (CC BY 4.0); A11YBench (MIT); WebA11yBench (CC BY 4.0); **mutation pairs** we generate by breaking accessible MIT-licensed components (ours); W3C ACT rule test cases | Server (CPU, quantized GGUF) or Ollama for self-host | Patched output passes axe on ≥ 85 % of test cases with no change to visible rendering |
| **M6** | **Readability scorer + simplifier** | T1, T2 | Scorer: ModernBERT-base (Apache-2.0). Simplifier: Qwen2.5-0.5B/1.5B-Instruct (Apache-2.0) | OneStopEnglish (CC BY-SA 4.0); WikiLarge-clean (CC BY-SA 4.0); CLEAR corpus (metadata MIT, passages mixed: filter to PD/CC BY); ASSET for evaluation only (CC BY-NC 4.0) | Browser (scorer), server (simplifier) | SARI ≥ prompted baseline on ASSET; meaning preserved in human check ≥ 90 % |
| **M7** | **Vague link/button text classifier** | T3 | ModernBERT-base or MiniLM (Apache-2.0) | Accessible names extracted from our synthetic pages + LLM-assisted labels, human-verified (ours) | Browser | F1 ≥ 0.85 |
| **M8** | **Caption ASR** (optional fine-tune) | H2 | Whisper small / distil-whisper (MIT) | LibriSpeech (CC BY 4.0); Common Voice (CC0) | Server or browser (WebGPU) | WER improvement on our test clips; otherwise use stock Whisper |

**Explicitly avoided** (license reasons):
- Ultralytics YOLOv8–v12 (AGPL-3.0): incompatible with MIT distribution.
- Qwen2.5-3B / Qwen2.5-VL-3B (Qwen Research License, non-commercial).
- Gemma / PaliGemma (Gemma Terms of Use, not OSI-approved). Acceptable for experiments, not for shipped weights.

### 8.4 Evaluation sets (built in Phase 0)

| Set | Size target | Source |
|---|---|---|
| Web element detection test | 500 screenshots | Synthetic renders + 100 hand-labeled real pages from verified-owner sites |
| Icon naming test | 1,000 crops | Widget Captioning test split + 200 web icons labeled by us |
| Alt text test | 300 images in context | Concadia test split + 100 from verified sites, rated by blind reviewers |
| Patch test | 400 violations | ACT rule failed cases + AccessGuru held-out + our mutations |
| Simplification test | ASSET test set | ASSET (eval only, non-commercial OK for evaluation) |

Every model is compared against (a) rules-only and (b) prompted hosted model on the same set. Results are published in the model card.

### 8.5 Training infrastructure (free)

- **Compute:** Kaggle Notebooks (~30 GPU hours/week), Google Colab free T4, Hugging Face free CPU for preprocessing.
- **Methods:** LoRA / QLoRA via Hugging Face PEFT or Unsloth; full fine-tune only for ≤ 0.25B models.
- **Tracking:** Weights & Biases free tier or MLflow locally.
- **Export:** ONNX (+ int8/q4 quantization) for browser; GGUF for Ollama.
- **Publishing:** Hugging Face Hub with model cards listing data, licenses, eval results, and known failure modes.

### 8.6 Distillation (teacher models)

To create synthetic training labels (e.g., patch explanations), only use teachers whose terms allow training other models: DeepSeek-R1 (MIT) or Llama models per their license terms. **Do not use Gemini, OpenAI, or Anthropic API outputs as training data** unless their current terms allow it. Re-check terms before each data-generation run.

---

## 9. Data inventory

| Dataset | Content | License | Use in Lens | Link |
|---|---|---|---|---|
| RICO (semantic annotations) | 66k Android screens; 24 component types, 97 icon classes | CC BY 4.0 (per HF mirror) | Train M1, M2 | interactionmining.org/rico; huggingface.co/datasets/Voxel51/rico |
| RICO Semantics (Google) | ~500k human annotations: icon shape/semantics, label association, accurate boxes | CC BY-SA 4.0 | Train M1, M2 (weights released CC BY-SA to be safe) | github.com/google-research-datasets/rico_semantics |
| Widget Captioning | 61k captions describing UI element function | CC BY 4.0 | Train M2 | github.com/google-research-datasets/widget-caption |
| Screen2Words | Screen summaries for RICO screens | CC BY 4.0 | Train M4 | github.com/google-research-datasets/screen2words |
| WebUI (CMU, CHI 2023) | 400k web page screenshots + metadata | **Research terms**; screenshots may be copyrighted | **Experiments only**, not shipped weights | huggingface.co/datasets/biglab/webui-all |
| Concadia | 97k Wikipedia images with alt text, captions, context | Per-image Wikimedia licenses; repo "Other" | Train/eval M3 (filter to CC BY / CC BY-SA / PD images) | github.com/elisakreiss/concadia |
| VizWiz-Captions | 39k photos taken by blind people, 5 captions each | Public for research; captions license not clearly stated | **Eval only** until license confirmed | vizwiz.org/tasks-and-datasets/image-captioning |
| AccessGuru (ASSETS 2025) | 3.5k real-world HTML violations, 112 types, WCAG refs | CC BY 4.0 | Train/eval M5 | doi.org/10.18419/DARUS-5177; github.com/NadeenAhmad/AccessGuruLLM |
| A11YBench | 8.9k violations across 60 real web projects | MIT | Eval M5 (repo-level repair) | huggingface.co/datasets/LLM4APR/A11YBench |
| WebA11yBench | 5k prompt → accessible code pairs (distilled from DeepSeek-V3) | CC BY 4.0 | Train M5 | zenodo.org/records/17127458 |
| W3C ACT Rules test cases | Passed/failed examples per rule | W3C Software and Document License | Eval M5; grounding for F1 | w3.org/WAI/standards-guidelines/act/rules |
| WCAG 2.2 + Understanding docs | Normative + explanatory text | W3C Document License | Retrieval for F1 | w3.org/TR/WCAG22 |
| OneStopEnglish | 189 texts × 3 reading levels | CC BY-SA 4.0 | Train M6 scorer + simplifier | github.com/nishkalavallabhi/OneStopEnglishCorpus |
| WikiLarge (clean) | Wikipedia → Simple Wikipedia sentence pairs | CC BY-SA 4.0 | Train M6 simplifier | huggingface.co/datasets/eilamc14/wikilarge-clean |
| CLEAR corpus (CommonLit) | ~5k passages with readability scores | Metadata MIT; passages mixed licenses | Train M6 scorer (PD / CC BY passages only) | Verify source before use |
| ASSET | Simplification references | **CC BY-NC 4.0** | **Eval only** | huggingface.co/datasets/facebook/asset |
| LibriSpeech | 1,000 h read English speech | CC BY 4.0 | M8 (optional) | openslr.org/12 |
| Common Voice | Crowdsourced speech, many languages | CC0 (downloads via Mozilla Data Collective; terms/approval required, some releases paid) | M8 (optional) | mozilladatacollective.com |
| TORGO | Dysarthric speech | Free for **non-commercial academic** use | Research only; not in shipped weights | cs.toronto.edu/~complingweb/data/TORGO/torgo.html |
| VisText, ChartQA | Chart captions / chart QA | **GPL-3.0** | Deferred (chart descriptions, P2+); legal review first | github.com/mitvis/vistext; github.com/vis-nlp/ChartQA |

**ShareAlike rule:** any model trained on CC BY-SA data (RICO Semantics, OneStopEnglish, WikiLarge) is published with its weights under CC BY-SA 4.0 and attribution in the model card. Models trained only on CC BY / MIT / our own data can be released Apache-2.0.

---

## 10. Data we generate ourselves

### 10.1 Synthetic data (no privacy or copyright risk)
- **Synthetic web screenshots (M1, M7):** render pages built from MIT/Apache-licensed UI kits and templates in Playwright at many viewports, themes, and zoom levels. Labels come for free from the DOM and accessibility tree (box, role, accessible name).
- **Mutation pairs (M5):** start from accessible components; programmatically break them (remove `alt`, strip labels, lower contrast, replace `<button>` with `<div>`, break heading order). The original is the fix. Verify each pair with axe.

### 10.2 User feedback (opt-in)
- Logged per suggestion: accepted / edited (with final text) / rejected, and finding type.
- **Collected for training only if:** the user is logged in, opted in, and the content comes from a site they verified ownership of (U4) or from their own uploads. Anonymous scans of third-party sites are never used for training.
- Screenshots of third-party sites are deleted after 30 days; only derived, non-visual labels may be kept (with opt-in).
- Becomes: more fine-tuning data (edited text = target) and preference pairs (accepted vs. rejected) for DPO later.
- A public, periodically released **Lens Feedback Dataset** (CC BY 4.0) of de-identified suggestion/edit pairs from consenting users.

---

## 11. Architecture (free tier)

```
Browser (Next.js app, in-browser models via ONNX/WebGPU, TTS)
   │
   ├── Vercel (Next.js, API routes, .tech domain)
   │       │
   │       ├── Supabase: Auth, Postgres (+ pgvector), Storage, Realtime (scan progress)
   │       └── LLM providers: Groq / Gemini free tier, or user's own key
   │
   └── Scan worker (Docker: Playwright + Chromium + axe-core)
           Hugging Face Spaces (free CPU: 2 vCPU / 16 GB) or Render free
```

| Layer | Choice | Free-tier constraint and mitigation |
|---|---|---|
| Web app | Next.js + TypeScript on Vercel Hobby | Serverless time limits → heavy work goes to the worker |
| Scan worker | Playwright + Chromium + axe-core in Docker on Hugging Face Spaces (free CPU) | Sleeps when idle → show "warming up" state; queue jobs in Postgres |
| Database/auth/files | Supabase free | 500 MB DB, 1 GB storage, pauses after inactivity → compress screenshots (WebP), 30-day expiry, weekly keep-alive ping |
| Realtime progress | Supabase Realtime | Free connection caps are far above expected concurrency |
| In-browser ML | `transformers.js` / `onnxruntime-web` (WebGPU, WASM fallback) | Model download size → lazy-load per lens, cache in IndexedDB |
| Hosted LLM | Groq / Gemini free tier, per-user daily quota | Rate limits → queue + BYOK + Ollama for self-host |
| Self-host | `docker compose` (app + worker + Postgres + optional Ollama) | — |
| CI | GitHub Actions for tests, Lighthouse/axe on Lens itself, model eval jobs | — |

**Privacy note:** free tiers of some hosted LLM APIs may use submitted content to improve their products. Lens must (a) disclose which provider processes what, (b) run screenshot models in-browser by default, and (c) send only the minimal snippet (element HTML + nearby text) to hosted models, never full pages or screenshots, unless the user opts in.

---

## 12. Security, abuse, and ethics

- **SSRF:** the scan worker resolves URLs and blocks private, loopback, link-local, and cloud-metadata IP ranges, including after redirects. No cookies or auth headers are forwarded.
- **Abuse:** per-IP and per-account rate limits; CAPTCHA (Cloudflare Turnstile, free) for anonymous bursts; honor `robots.txt` and a `lens-noscan` meta opt-out.
- **Report links:** unguessable IDs, `noindex`, expiry, owner can delete.
- **Model safety:** alt-text and label models must not guess identity, race, gender, or disability of people in images; prompt and training filters enforce describing visible content only.
- **Simulation ethics:** every simulation states that it is an approximation of one aspect of one condition, not "what it's like to be disabled," and links to lived-experience notes (L2).
- **Lens's own accessibility:** WCAG 2.2 AA; tested with NVDA, VoiceOver, keyboard-only, and 400 % zoom before each release; axe in CI blocks merges on serious issues.

---

## 13. Roadmap (12 months)

| Months | Milestone | Ships |
|---|---|---|
| 1 | Foundations | Repo (MIT), design system with accessible components, Supabase schema, scan worker prototype, CI with axe on Lens itself |
| 2–3 | **Public MVP (P0)** | URL + HTML scan, audit engine, screen-reader order + listen mode, color/low-vision/zoom lenses, keyboard path, target-size map, explanations, alt/label drafts (prompted), share links, exports, anonymous + GitHub sign-in. Live on `.tech` domain |
| 3–4 | Data foundations | Eval sets (§8.4), feedback logging, synthetic screenshot generator, mutation-pair generator |
| 4–6 | **v1.0 (P1)** | Browser extension, code patches with axe re-check, bulk review queue, palette fixer, readability + plain-language, link-text checks, media inventory, GitHub issues, CLI + Action, projects, ownership verification, pattern library |
| 5–7 | First fine-tunes | **M2** icon namer and **M1** element detector → browser ONNX → screenshot mode (S3) |
| 7–9 | Text and patch models | **M5** patch model, **M6** readability, **M7** link-text classifier |
| 9–10 | Alt text model | **M3** with blind reviewers; publish models + cards on Hugging Face |
| 10–12 | Polish and community | Workshop mode, Figma plugin (if capacity), first Lens Feedback Dataset release, docs for contributors, accessibility audit of Lens with disabled testers |

---

## 14. Risks and open questions

| Risk | Mitigation |
|---|---|
| Free-tier limits or policy changes (worker sleeps, LLM quotas) | Queue + graceful "try again" states, BYOK, Ollama, self-host path documented from day one |
| Fine-tuned models don't beat prompting | That's an acceptable outcome; ship rules + prompting, publish the comparison |
| Mobile-trained data (RICO) doesn't transfer to the web | Synthetic web screenshots are the main M1 training source; RICO used for pretraining |
| Users trust AI alt text blindly | Review queue, "AI draft" labels, alt text quality hints, never auto-apply |
| Simulations criticized as reductive | Framing, lived-experience content, disabled co-designers and paid testers |
| Legal: users treat Lens as a compliance certificate | Persistent "automated checks don't prove compliance" banner; no badges or "compliant" claims |
| ShareAlike / GPL data contaminating licenses | Data inventory (§9) gating; license check in the training pipeline config |

**Open questions**
1. Final product name and domain.
2. Hugging Face Spaces vs. Render for the scan worker. Benchmark Chromium memory and cold start on both.
3. Do we ship the IBM Equal Access engine alongside axe, or keep one engine for consistency?
4. Budget (even small) for paying disabled testers and lived-experience contributors: grants, sponsors, or GitHub Sponsors.
5. Which languages beyond English in year one (affects M3, M6, TTS voices)?

---

## Appendix A — Base model licenses

| Model | Size | License | Notes |
|---|---|---|---|
| Florence-2-base / large | 0.23B / 0.77B | MIT | Strong at captioning + grounding; browser-capable (base) |
| SmolVLM-256M / 500M | 0.26B / 0.5B | Apache-2.0 | Designed for on-device |
| RT-DETR / RF-DETR | — | Apache-2.0 | Detection without AGPL |
| SmolLM3-3B | 3B | Apache-2.0 | Patch model candidate |
| Qwen2.5-0.5B/1.5B-Instruct, Qwen2.5-Coder-1.5B | 0.5–1.5B | Apache-2.0 | Avoid the 3B size (research license) |
| ModernBERT-base, MiniLM | ~0.02–0.15B | Apache-2.0 | Classifiers |
| Whisper / distil-whisper | 0.07–1.5B | MIT | Captions |
| Kokoro-82M | 82M | Apache-2.0 | TTS |

Licenses verified against model cards on 13 Oct 2026; re-check before each release.
