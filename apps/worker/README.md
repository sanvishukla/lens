# @lens/worker

Headless scan worker. Claims queued scans from Supabase, renders each page in Chromium, runs the audit, and writes the result back.

```
claim_next_scan()  →  render (desktop 1280px + narrow 320px)
                   →  axe-core, reading order, tab path, target sizes, reflow
                   →  screenshots to Storage, result JSON + findings rows to Postgres
```

## Run locally

```bash
npx playwright install chromium   # once
npm run dev --workspace @lens/worker
```

It reads `SUPABASE_URL` and `SUPABASE_SECRET_KEY` from the root `.env`.

## Deploy on Hugging Face Spaces (free CPU)

1. Create a **Docker** Space.
2. Push this repo (or a copy with only `package.json`, `packages/core`, `apps/worker`, `apps/web/package.json`) to the Space.
3. Add a `README.md` at the Space root with:
   ```yaml
   ---
   sdk: docker
   app_port: 7860
   ---
   ```
   and point the Space at `apps/worker/Dockerfile`, or copy that Dockerfile to the Space root.
4. Set `SUPABASE_URL` and `SUPABASE_SECRET_KEY` as Space secrets.

The worker serves a health check on `PORT` (7860). Free Spaces sleep when idle; the web app shows a "waking up" message while scans wait in the queue.

## Security

- Every request the browser makes (page, redirects, subresources) is checked against private, loopback, link-local, and metadata IP ranges in `src/security/ssrf.ts`.
- Chromium resolves DNS itself, so a DNS-rebinding host can still race that check. Run the worker somewhere with no access to internal networks.
