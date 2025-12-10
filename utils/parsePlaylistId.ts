export type ParseError =
  | 'InvalidFormat'
  | 'NoPlaylistId'
  | 'PrivateOrUnembeddable'
  | 'Other';

export type ParseSuccess = {
  ok: true;
  id: string;
  sourceFormat: 'query' | 'id-only' | 'unknown';
};

export type ParseResult = ParseSuccess | { ok: false; error: ParseError; raw: string };

/**
 * Parse a user-supplied string and attempt to extract a YouTube playlist ID.
 * Accepts common forms:
 *  - https://www.youtube.com/playlist?list=PL...    (query)
 *  - https://www.youtube.com/watch?v=...&list=PL...
 *  - https://youtu.be/xyz?list=PL...
 *  - raw playlist id (e.g. PLabcd1234)
 */
export function parsePlaylistId(input: unknown): ParseResult {
  const raw = typeof input === 'string' ? input.trim() : String(input ?? '').trim();

  if (!raw) {
    return { ok: false, error: 'InvalidFormat', raw };
  }

  // Look for list=... in query string
  const listMatch = raw.match(/[?&]list=([A-Za-z0-9_-]{6,})/);
  if (listMatch && listMatch[1]) {
    return { ok: true, id: listMatch[1], sourceFormat: 'query' };
  }

  // If the user pasted only an id-like token (common playlist ids are >= 10 chars)
  const idOnlyMatch = raw.match(/^[A-Za-z0-9_-]{10,}$/);
  if (idOnlyMatch) {
    return { ok: true, id: idOnlyMatch[0], sourceFormat: 'id-only' };
  }

  // If it's a YouTube URL but has no list param, it's a known case (single-video link)
  if (/youtube\.com|youtu\.be/i.test(raw)) {
    return { ok: false, error: 'NoPlaylistId', raw };
  }

  // Otherwise it's not recognized as a URL or id
  return { ok: false, error: 'InvalidFormat', raw };
}

export default parsePlaylistId;
