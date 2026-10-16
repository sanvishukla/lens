import { lookup } from "node:dns/promises";
import { BlockList, isIP } from "node:net";

export class UnsafeUrlError extends Error {}

const blocked = new BlockList();
for (const [network, prefix] of [
  ["0.0.0.0", 8],
  ["10.0.0.0", 8],
  ["100.64.0.0", 10],
  ["127.0.0.0", 8],
  ["169.254.0.0", 16],
  ["172.16.0.0", 12],
  ["192.0.0.0", 24],
  ["192.168.0.0", 16],
  ["198.18.0.0", 15],
  ["224.0.0.0", 4],
  ["240.0.0.0", 4],
] as const) {
  blocked.addSubnet(network, prefix, "ipv4");
}
// No ::ffff:0:0/96 rule: BlockList applies it to every IPv4 address, and the IPv4 rules above
// already match IPv4-mapped IPv6 addresses.
for (const [network, prefix] of [
  ["::", 128],
  ["::1", 128],
  ["64:ff9b::", 96],
  ["fc00::", 7],
  ["fe80::", 10],
  ["ff00::", 8],
] as const) {
  blocked.addSubnet(network, prefix, "ipv6");
}

export function isBlockedAddress(address: string): boolean {
  const family = isIP(address);
  if (family === 0) return true;
  return blocked.check(address, family === 4 ? "ipv4" : "ipv6");
}

const verdicts = new Map<string, Promise<void>>();

async function assertPublicHost(hostname: string): Promise<void> {
  const host = hostname.replace(/^\[|\]$/g, "");
  if (host === "localhost" || host.endsWith(".localhost") || host.endsWith(".internal")) {
    throw new UnsafeUrlError(`Refusing to scan internal host ${host}`);
  }
  const addresses = isIP(host) ? [{ address: host }] : await lookup(host, { all: true, verbatim: true });
  if (addresses.length === 0 || addresses.some(({ address }) => isBlockedAddress(address))) {
    throw new UnsafeUrlError(`Refusing to scan ${host}: it resolves to a private or reserved address`);
  }
}

/** Throws unless `raw` is an http(s) URL whose host resolves only to public addresses. */
export async function assertPublicUrl(raw: string): Promise<URL> {
  let url: URL;
  try {
    url = new URL(raw);
  } catch {
    throw new UnsafeUrlError("Not a valid URL");
  }
  if (url.protocol !== "http:" && url.protocol !== "https:") {
    throw new UnsafeUrlError("Only http and https URLs can be scanned");
  }
  if (url.username || url.password) {
    throw new UnsafeUrlError("URLs with credentials are not allowed");
  }

  let verdict = verdicts.get(url.hostname);
  if (!verdict) {
    verdict = assertPublicHost(url.hostname);
    verdicts.set(url.hostname, verdict);
    setTimeout(() => verdicts.delete(url.hostname), 60_000).unref();
  }
  await verdict;
  return url;
}
