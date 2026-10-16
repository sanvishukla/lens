# apps/extension (later phase)

Browser extension (Manifest V3) that runs the same lenses on any page you're logged into, including
pages the server scanner can't reach (intranets, staging, authenticated flows). Scans run locally;
nothing is uploaded unless you choose to share a report.

Planned: reuse `@lens/core` and the worker's scan modules, injected as content scripts.
