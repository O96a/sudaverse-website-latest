/**
 * In-memory sliding-window rate limiter plus client-IP extraction.
 *
 * State lives in this process only: a restart clears it, and running several instances gives each
 * its own budget. That is acceptable for a low-volume contact form on a single small host.
 */

import { isIP } from 'node:net';

const MAX_TRACKED_KEYS = 20_000;

export function createRateLimiter({ max, windowMs, now = Date.now }) {
  /** key -> ascending list of hit timestamps still inside the window */
  const hits = new Map();

  function prune(t) {
    for (const [key, list] of hits) {
      while (list.length && list[0] <= t - windowMs) list.shift();
      if (!list.length) hits.delete(key);
    }
  }

  return {
    /** Record one request for `key`. Returns whether it is allowed and, if not, seconds to wait. */
    hit(key) {
      const t = now();
      let list = hits.get(key);
      if (list) {
        while (list.length && list[0] <= t - windowMs) list.shift();
      } else {
        if (hits.size >= MAX_TRACKED_KEYS) {
          prune(t);
          // Still full of live entries (an attack): drop the oldest key rather than grow without bound.
          if (hits.size >= MAX_TRACKED_KEYS) hits.delete(hits.keys().next().value);
        }
        list = [];
        hits.set(key, list);
      }
      if (list.length >= max) {
        return { allowed: false, retryAfterSeconds: Math.max(1, Math.ceil((list[0] + windowMs - t) / 1000)) };
      }
      list.push(t);
      return { allowed: true, retryAfterSeconds: 0 };
    },
    size: () => hits.size,
  };
}

/** Expand an IPv6 address into its 8 hextets (lower-case, no leading zeros). */
function hextets(ip) {
  const [head, tail] = ip.split('%')[0].split('::');
  const a = head ? head.split(':') : [];
  const b = tail === undefined ? [] : tail ? tail.split(':') : [];
  const fill = tail === undefined ? 0 : Math.max(8 - a.length - b.length, 0);
  return [...a, ...Array(fill).fill('0'), ...b].map((g) => (parseInt(g || '0', 16) || 0).toString(16));
}

/** Rate-limit key for an address: IPv4 as is, IPv6 by its /64 (a single subscriber owns a whole /64). */
export function ipKey(ip) {
  if (ip.startsWith('::ffff:') && isIP(ip.slice(7)) === 4) return ip.slice(7);
  if (isIP(ip) === 6) return hextets(ip).slice(0, 4).join(':') + '::/64';
  return ip;
}

/**
 * The client address. With `trustProxy = N > 0` the address is taken from X-Forwarded-For, N
 * entries from the right: each trusted proxy appends the address it saw, so entries to the left of
 * that point are supplied by the client and are ignored. With 0, the socket address is used.
 */
export function clientIp(req, trustProxy = 0) {
  const socketIp = req.socket?.remoteAddress ?? 'unknown';
  if (trustProxy > 0) {
    const forwarded = String(req.headers['x-forwarded-for'] ?? '')
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);
    if (forwarded.length >= trustProxy) {
      const candidate = forwarded[forwarded.length - trustProxy];
      if (isIP(candidate)) return candidate;
    }
  }
  return socketIp;
}
