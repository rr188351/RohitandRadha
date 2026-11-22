/**
 * Central wedding configuration.
 *
 * All user-facing wedding information lives here so it never has to be hunted
 * down across components.
 *
 * The names and the invitation wording are known. Every logistics field below
 * is intentionally left `null` until the details are confirmed — the hero only
 * renders a detail once it has a real value, so no placeholder text ever
 * reaches the designed screen.
 *
 * To fill in a detail later, just replace the `null`, e.g.
 *   dateLabel: '14 February 2027',
 *   venueName: 'Siyaram Plaza',
 */
/**
 * The couple's names, kept in their own binding so the wording below can refer
 * to them and a change only ever has to be made in one place.
 */
const names = {
  first: 'Radha',
  second: 'Rohit',
};

export const wedding = {
  /* ---------------------------------------------------------------------
     Provided
     --------------------------------------------------------------------- */
  names,

  label: 'The Wedding Invitation',

  copy: {
    families: 'Together with their families',
    invite: 'Invite you to celebrate their wedding',
  },

  /* Phase 03 — the heartfelt message below the hero. Design copy, kept here so
     every word of the invitation is editable in one place. */
  celebration: {
    label: 'A Celebration of Love',
    titleTop: 'A Celebration',
    titleLead: 'of',
    titleAccent: 'Two Souls',
    message:
      'With the blessings of our families, we invite you to join us as we celebrate a beautiful beginning and the union of two souls.',
  },

  /* Phase 04 — the celebrations showcase. Names, descriptors and descriptions
     are design copy; every factual field stays `null` until it is confirmed,
     and each row hides itself completely when empty. */
  celebrations: {
    label: 'The Celebrations',
    title: 'Gathered in Joy',
    intro:
      'The rituals that bring our families together, each with its own colour and character.',
    events: [
      {
        id: 'haldi',
        theme: 'haldi',
        label: 'Sunshine & Blessings',
        name: 'Haldi',
        description:
          'A celebration of sunshine, blessings, laughter and turmeric traditions.',
        dateLabel: null,
        timeLabel: null,
        venueName: null,
        venueLocation: null,
        venueAddress: null,
      },
      {
        id: 'mehendi',
        theme: 'mehendi',
        label: 'Henna & Tradition',
        name: 'Mehendi',
        description:
          'A beautiful celebration of intricate henna, traditions, family and joy.',
        dateLabel: null,
        timeLabel: null,
        venueName: null,
        venueLocation: null,
        venueAddress: null,
      },
      {
        id: 'ceremony',
        theme: 'wedding',
        label: 'The Sacred Union',
        name: 'Wedding Ceremony',
        description: `The sacred union of ${names.first} & ${names.second}, surrounded by blessings, family and love.`,
        // Decorative only: gives the ceremony the grandest treatment.
        frame: true,
        dateLabel: null,
        timeLabel: null,
        venueName: null,
        venueLocation: null,
        venueAddress: null,
      },
    ],
  },

  /* Phase 06 — the celebration timeline. It reads the very same
     `celebrations.events` above, so an event is described in exactly one place
     and filling in a real date, time or venue lights up both sections at once. */
  timeline: {
    eyebrow: 'The Wedding Journey',
    title: 'Days of Celebration',
    intro:
      'Every gathering, every ritual, every moment — a celebration of togetherness.',
  },

  /* Phase 07 — the RSVP, connected to a real backend in Phase 17.
     A reply is sent to the couple's own API and stored in the wedding's own
     database BEFORE the guest is told it arrived — see `src/config/rsvpApi.js`
     and the submit handler in `src/components/RSVPSection.jsx`. Each reply
     carries a request id that is stable across retries, so a dropped connection
     can never become a second record. */
  rsvp: {
    eyebrow: 'Your presence is our gift',
    titleLead: 'We Would Love',
    titleAccent: 'To Have You With Us',
    intro:
      'Your presence would make our celebration even more special. Kindly let us know if you will be joining us.',

    accept: {
      label: 'Joyfully Accept',
      note: 'We will be there to celebrate with you',
      confirm: 'We are delighted that you will be joining us.',
    },

    decline: {
      label: 'Regretfully Decline',
      note: 'We will be thinking of you',
      message:
        'Thank you for letting us know. You will be missed, and we will be thinking of you.',
    },

    /* Shown beneath the panel while the guest is still deciding or filling in
       their details. */
    submitNote:
      'Your reply is sent straight to us and is kept only for our wedding.',

    /* Shown in place of the form once the reply has actually been stored. */
    receivedNote: 'Your reply has reached us safely. Thank you.',

    /* Shown when a reply could not be delivered. `src/config/rsvpApi.js`
       replaces this with something more specific (a timeout, a rate limit or a
       rejected detail) whenever it can. */
    errorNote: 'Something interrupted your reply. Please try again.',
  },

  /* Phase 08 — the final blessing. The last page of the invitation: a quiet
     closing after the RSVP, with nothing factual invented. */
  closing: {
    eyebrow: 'With love & blessings',
    titleLead: 'We Cannot Wait',
    titleAccentLead: 'To Celebrate',
    titleAccent: 'With You',
    message:
      'Until the day our hearts and families come together, may love, happiness and blessings surround us all.',
    signoff: 'With love, always.',
  },

  /* ---------------------------------------------------------------------
     Awaiting confirmation — leave `null` until the details are final
     --------------------------------------------------------------------- */
  dateLabel: null, // e.g. '14 February 2027'
  timeLabel: null, // e.g. '7:00 pm onwards'
  venueName: null, // e.g. 'Siyaram Plaza'
  venueLocation: null, // e.g. 'Ballia, Uttar Pradesh'
  venueAddress: null, // full postal address, shown when provided
};

/**
 * True when the given source carries at least one logistics detail. Used by the
 * shared details block so it can serve the wedding itself or a single event.
 */
export function hasDetails(source) {
  return Boolean(
    source &&
      (source.dateLabel ||
        source.timeLabel ||
        source.venueName ||
        source.venueLocation ||
        source.venueAddress),
  );
}

/**
 * True once at least one wedding-level detail is known.
 */
export function hasEventDetails() {
  return hasDetails(wedding);
}
