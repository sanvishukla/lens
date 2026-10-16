import type { Page } from "playwright";
import type { ReadingNode } from "@lens/core";

interface AXValue {
  value?: unknown;
}
interface AXNode {
  nodeId: string;
  ignored: boolean;
  role?: AXValue;
  name?: AXValue;
  properties?: { name: string; value: AXValue }[];
  childIds?: string[];
}

const SKIP_ROLES = new Set(["generic", "none", "InlineTextBox", "LineBreak", "RootWebArea", "paragraph", "group", "Section"]);
const NAME_REQUIRED = new Set(["button", "link", "image", "img", "textbox", "checkbox", "combobox", "radio", "switch", "slider"]);
const ATOMIC = new Set([...NAME_REQUIRED, "heading"]);

/** Linearized view of what a screen reader announces, from Chromium's accessibility tree. */
export async function readingOrder(page: Page): Promise<ReadingNode[]> {
  const cdp = await page.context().newCDPSession(page);
  const { nodes } = (await cdp.send("Accessibility.getFullAXTree")) as unknown as { nodes: AXNode[] };
  await cdp.detach();

  const byId = new Map(nodes.map((n) => [n.nodeId, n]));
  const out: ReadingNode[] = [];
  let lastHeadingLevel = 0;

  const visit = (node: AXNode | undefined): void => {
    if (!node) return;
    if (!node.ignored) {
      const rawRole = String(node.role?.value ?? "");
      const role = rawRole === "StaticText" ? "text" : rawRole;
      const name = String(node.name?.value ?? "").trim();
      if (!SKIP_ROLES.has(role)) {
        const entry: ReadingNode = { role, name };
        if (role === "heading") {
          const level = Number(node.properties?.find((p) => p.name === "level")?.value.value ?? 0);
          entry.level = level;
          if (lastHeadingLevel && level > lastHeadingLevel + 1) {
            entry.issue = `Skips from heading level ${lastHeadingLevel} to ${level}`;
          }
          lastHeadingLevel = level;
        }
        if (NAME_REQUIRED.has(role) && !name) entry.issue = `Unlabeled ${role}`;
        if (name || entry.issue || role === "heading") out.push(entry);
        if (ATOMIC.has(role)) return;
      }
    }
    for (const id of node.childIds ?? []) visit(byId.get(id));
  };

  visit(nodes[0]);
  return out;
}
