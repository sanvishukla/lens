import { createServer } from "node:http";
import { setTimeout as sleep } from "node:timers/promises";
import { claimNextScan, completeScan, failScan } from "./queue.ts";
import { runScan } from "./scan/index.ts";
import { closeBrowser } from "./scan/render.ts";

const port = Number(process.env.PORT ?? 7860);
const pollMs = Number(process.env.WORKER_POLL_INTERVAL_MS ?? 2000);
let running = true;

createServer((_req, res) => {
  res.writeHead(200, { "content-type": "text/plain" });
  res.end("ok");
}).listen(port, () => console.log(`worker health check on :${port}`));

async function loop(): Promise<void> {
  while (running) {
    const job = await claimNextScan().catch((err: unknown) => {
      console.error("claim failed", err);
      return null;
    });
    if (!job) {
      await sleep(pollMs);
      continue;
    }
    console.log(`scan ${job.id} (${job.kind}) started`);
    try {
      await completeScan(job.id, await runScan(job));
      console.log(`scan ${job.id} done`);
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      console.error(`scan ${job.id} failed: ${message}`);
      await failScan(job.id, message).catch((e: unknown) => console.error("failScan", e));
    }
  }
}

for (const signal of ["SIGINT", "SIGTERM"] as const) {
  process.on(signal, () => {
    running = false;
    void closeBrowser().finally(() => process.exit(0));
  });
}

void loop();
