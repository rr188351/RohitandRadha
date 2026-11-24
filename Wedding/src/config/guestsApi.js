/**
 * The public guest wall's data source.
 *
 * The names come from the couple's own API — the same service the RSVP posts to.
 * That endpoint is read-only and hands back a display name per guest and nothing
 * else (`GET /api/wedding/guests`), so the invitation can celebrate the people
 * who accepted without the page ever holding more than their names.
 */
import { RSVP_API_BASE } from './rsvpApi.js';

/** The one public read route into the wedding data. */
export const GUESTS_ENDPOINT = `${RSVP_API_BASE}/api/wedding/guests`;

/**
 * How often the wall refreshes itself.
 *
 * A minute is the balance: a name appears quickly, while the API is asked for
 * the list at a rate a whole wedding can sustain. The wall also refreshes the
 * moment the tab becomes visible again, so a phone that spent the evening in a
 * pocket is up to date on the first look.
 */
export const GUEST_REFRESH_MS = 60000;

/** A short budget: this is a background refresh, not a guest waiting on a form. */
export const GUESTS_TIMEOUT_MS = 15000;

/**
 * Dispatched on `window` when a reply has just been stored.
 *
 * The wall listens for it and refreshes at once, so the guest who has this very
 * moment accepted sees their own name arrive instead of waiting for the next
 * tick. It is a plain DOM event: no shared store, no extra dependency.
 */
export const RSVP_ACCEPTED_EVENT = 'wedding:rsvp-accepted';

/**
 * Reads the display names of the guests who accepted.
 *
 * @returns {Promise<string[]>} names, oldest reply first
 * @throws {Error} when the list could not be read (the caller shows its
 *         graceful state; nothing about the failure is surfaced to a guest)
 */
export async function fetchAcceptedGuests() {
  const controller = new AbortController();
  const timer = window.setTimeout(() => controller.abort(), GUESTS_TIMEOUT_MS);

  try {
    const response = await fetch(GUESTS_ENDPOINT, {
      headers: { Accept: 'application/json' },
      signal: controller.signal,
      // The route is uncached; this keeps a stale intermediary out of the path.
      cache: 'no-store',
    });

    if (!response.ok) {
      throw new Error(`guests request failed (${response.status})`);
    }

    const body = await response.json();
    if (body?.success !== true || !Array.isArray(body.guests)) {
      throw new Error('guests response was not understood');
    }

    // Defensive: only a non-empty string ever becomes a name on the wall.
    return body.guests
      .map((guest) => (typeof guest?.name === 'string' ? guest.name.trim() : ''))
      .filter(Boolean);
  } finally {
    window.clearTimeout(timer);
  }
}
