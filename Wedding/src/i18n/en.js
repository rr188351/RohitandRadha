/**
 * The ENGLISH dictionary - the shape every language shares.
 *
 * WHY THE ENGLISH ONE IS BUILT, NOT TYPED OUT
 * -------------------------------------------
 * The invitation's wording already lives in `src/config/wedding.js` and
 * `src/config/gallery.js`, in one place each. Copying it here would create a
 * second English source that could quietly drift from the first, so this file
 * COMPOSES the dictionary from those configs and adds only the strings that used
 * to be written inline in components (the music player's labels, the RSVP form's
 * field text, the automatic-scroll capsule).
 *
 * Hindi and Bhojpuri (`hi.js`, `bho.js`) then carry only what they translate:
 * anything they leave out falls back to the English string here, so a missing
 * key can never render as an empty gap.
 *
 * Tokens
 * ------
 * `{couple}` is replaced with the couple's names (kept in Latin script, never
 * translated) when the dictionary is resolved. `{count}`/`{name}` are filled in
 * at render time through the `format()` helper.
 */

import { wedding } from '../config/wedding.js';
import { gallery } from '../config/gallery.js';

/** Strings that used to live inside components. */
const ui = {
  intro: {
    label: 'The Wedding Invitation',
    taglineLead: 'A Celebration of',
    taglineAccent: 'Love',
    supporting: 'A beautiful beginning deserves a timeless invitation.',
    open: 'Open the Invitation',
  },

  /* The single word between the couple's names in the hero. */
  hero: {
    and: 'and',
  },

  /* The five labels of the (currently empty) details block. */
  details: {
    day: 'The Day',
    hour: 'The Hour',
    place: 'The Place',
    location: 'Location',
    address: 'Address',
  },

  music: {
    launch: 'Wedding music',
    launchIdle: 'Play wedding music',
    seek: 'Seek within the song',
    previous: 'Previous song',
    next: 'Next song',
    play: 'Play music',
    pause: 'Pause music',
    failed: 'This song could not be loaded.',
    tracks: { song1: 'Song 1', song2: 'Song 2' },
  },

  autoScroll: {
    playing: 'Auto playing',
    resuming: 'Resuming',
    paused: 'Paused',
    finished: 'Journey complete',
    pauseAction: 'Pause automatic scrolling',
    resumeAction: 'Resume automatic scrolling',
    stopAction: 'Stop automatic scrolling for this visit',
  },

  switcher: {
    label: 'Language',
    choose: 'Choose the language of the invitation',
  },

  rsvpForm: {
    legend: 'Your reply details',
    help: 'Will you be joining us?',
    optional: 'optional',
    name: 'Your name',
    namePlaceholder: 'As we should address you',
    nameRequired: 'Please add your name so we know who is replying.',
    guests: 'Guests joining you',
    email: 'Email Address',
    emailPlaceholder: 'Where we can send a confirmation, if you wish',
    emailInvalid: 'That address does not look quite right.',
    emailHint: 'Leave this blank and your reply is still complete.',
    note: 'A note for the couple',
    notePlaceholder: 'Share a wish, a blessing or a memory',
    declineNotePlaceholder: 'Share a wish or a blessing',
    submit: 'Send our reply',
    submitting: 'Sending your reply',
  },

  rsvpSection: {
    thanks: 'Thank you, {name}.',
    dearGuest: 'dear guest',
    partyOf: 'We have noted a party of {count}.',
    change: 'Change my reply',
  },

  /* The messages `src/config/rsvpApi.js` needs for a failed send. */
  api: {
    timeout:
      'Your reply took too long to reach us. Please check your connection and try again.',
    rateLimited:
      'We have already received several replies from this device. Please try again in a little while.',
    invalid: 'Some of the details need a second look. Please check them and try again.',
    fallback: 'We could not send your reply just now. Please try again in a moment.',
  },
};

/** The English tree. Everything a component can ask for lives under here. */
export const en = {
  meta: { code: 'en', label: 'English', native: 'English' },
  wedding,
  gallery,
  ui,
};

export default en;
