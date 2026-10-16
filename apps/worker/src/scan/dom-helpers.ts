declare global {
  interface Window {
    __lensPath?: (el: Element) => string;
  }
}

/**
 * Runs inside the page via `page.evaluate(installDomHelpers)`, so it must stay
 * self-contained: no imports or outer variables.
 */
export function installDomHelpers(): void {
  window.__lensPath = (el: Element): string => {
    const parts: string[] = [];
    let node: Element | null = el;
    while (node && parts.length < 6) {
      if (node.id) {
        parts.unshift(`#${CSS.escape(node.id)}`);
        break;
      }
      const current: Element = node;
      const tag = current.tagName.toLowerCase();
      const parent = current.parentElement;
      if (!parent) {
        parts.unshift(tag);
        break;
      }
      const siblings = Array.from(parent.children).filter((c) => c.tagName === current.tagName);
      parts.unshift(siblings.length > 1 ? `${tag}:nth-of-type(${siblings.indexOf(current) + 1})` : tag);
      node = parent;
    }
    return parts.join(" > ");
  };
}
