/**
 * Where a guest's reply is sent.
 *
 * The wedding invitation is a STATIC site (GitHub Pages), so it has no server of
 * its own: a reply travels to the couple's own Express API, which stores it in
 * the wedding's database (`wedding_rsvp.guests`) and confirms the write before
 * the guest is told it arrived.
 *
 * The deployed API is the default, so the built site works with no
 * configuration. To reply to a local backend during development, add an
 * untracked `.env.local` beside this project:
 *
 *   VITE_RSVP_API_URL=http://localhost:5000
 */

const DEPLOYED_API_BASE = 'https://twiller-2-0-92g7.onrender.com';

/** VITE_RSVP_API_URL when configured, otherwise the deployed API. */
function resolveApiBase() {
  const configured =
    typeof import.meta !== 'undefined' ? import.meta.env?.VITE_RSVP_API_URL : '';
  const trimmed = typeof configured === 'string' ? configured.trim() : '';
  // Trailing slashes would double up against the path below.
  return (trimmed || DEPLOYED_API_BASE).replace(/\/+$/, '');
}

export const RSVP_API_BASE = resolveApiBase();

/** The one endpoint that accepts a reply. */
export const RSVP_ENDPOINT = `${RSVP_API_BASE}/api/wedding/rsvp`;

/**
 * A sleeping Render instance can take a while to answer its first request, so
 * the wait is finite but generous. The guest sees the sending state throughout,
 * and a timeout becomes a retry-friendly message rather than a silent hang.
 */
export const RSVP_TIMEOUT_MS = 45000;

/** Marks replies that came from this invitation, beside any future source. */
export const RSVP_SOURCE = 'wedding_invitation';

/** Raised for a reply that could not be delivered. Carries the HTTP status. */
export class RsvpSubmissionError extends Error {
  constructor(message, { status = 0, code = 'unknown' } = {}) {
    super(message);
    this.name = 'RsvpSubmissionError';
    this.status = status;
    this.code = code;
  }
}

/**
 * A stable key for ONE reply.
 *
 * It is created when the guest chooses how to reply and reused on every retry,
 * so a dropped connection (or an impatient second press) can never turn one
 * reply into two records: the API recognises the key and returns the record
 * already stored.
 */
export function createRequestId() {
  const uuid = globalThis.crypto?.randomUUID?.();
  if (uuid) return uuid;
  // Only reached in a non-secure context; still unique enough for one reply.
  return `rsvp-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 12)}`;
}

/**
 * Turns a failure into something worth showing a guest.
 *
 * Never a driver, server or stack detail - only what the guest can act on.
 *
 * @param {unknown} error
 * @returns {string}
 */
export function describeRsvpError(error) {
  if (error?.code === 'timeout' || error?.name === 'AbortError') {
    return 'Your reply took too long to reach us. Please check your connection and try again.';
  }
  if (error?.status === 429) {
    return 'We have already received several replies from this device. Please try again in a little while.';
  }
  if (error?.status === 400) {
    return 'Some of the details need a second look. Please check them and try again.';
  }
  return 'We could not send your reply just now. Please try again in a moment.';
}

/**
 * Sends one reply.
 *
 * Resolves ONLY when the API has confirmed the reply is stored, so the success
 * screen can never appear for a reply that was not saved.
 *
 * @param {Record<string, unknown>} payload
 * @returns {Promise<{id?: string, duplicate?: boolean, receivedAt?: string}>}
 * @throws {RsvpSubmissionError}
 */
export async function sendRsvp(payload) {
  const controller = new AbortController();
  const timer = window.setTimeout(() => controller.abort(), RSVP_TIMEOUT_MS);

  try {
    const response = await fetch(RSVP_ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
      signal: controller.signal,
    });

    let body = null;
    try {
      body = await response.json();
    } catch {
      body = null;
    }

    if (!response.ok || body?.saved !== true) {
      throw new RsvpSubmissionError('The reply was refused.', {
        status: response.status,
        code: body?.code || 'http-error',
      });
    }

    return body;
  } catch (error) {
    if (error instanceof RsvpSubmissionError) throw error;
    if (error?.name === 'AbortError') {
      throw new RsvpSubmissionError('The request timed out.', { code: 'timeout' });
    }
    throw new RsvpSubmissionError('The request could not be completed.', {
      code: 'network',
    });
  } finally {
    window.clearTimeout(timer);
  }
}
