/**
 * Constant-velocity automatic scrolling for the invitation.
 *
 * The page is advanced by `speed` pixels per second, integrated from the real
 * frame delta. That keeps the pace identical whether the document is 6,000 or
 * 10,000 pixels tall — unlike a duration-based tween, which would speed up on
 * longer pages and slow down on shorter ones.
 *
 * Control always stays with the guest:
 *   · any wheel, touch, key or pointer input pauses immediately;
 *   · the page is never forced back to an automated position;
 *   · scrolling resumes only after `resumeDelay` ms of quiet, from wherever the
 *     guest left the page;
 *   · while a form field has focus — or the RSVP confirmation is on screen — it
 *     stays paused, so a focused input can never drift out of view.
 *
 * Everything is torn down by `destroy()`: no RAF loop, timer or listener is
 * left behind.
 */

/** Milliseconds the opening screen waits before it invites the guest in. */
export const AUTO_OPEN_DELAY = 7000;

/** Milliseconds after opening before the camera begins to move. */
export const AUTO_SCROLL_DELAY = 5000;

/** Pixels per second — a calm, readable pace. */
export const AUTO_SCROLL_SPEED = 70;

/**
 * Pixels per second on a phone.
 *
 * A little slower than the desktop so each section's reveal has time to play
 * out while the guest is actually looking at it, without turning the tour into
 * a crawl.
 */
export const AUTO_SCROLL_SPEED_PHONE = 58;

/** Milliseconds of quiet before scrolling picks itself back up. */
export const AUTO_SCROLL_RESUME_DELAY = 10000;

/** How long the "Resuming" state is shown before returning to "Playing". */
const RESUMING_LABEL_DURATION = 1800;

const FORM_FIELDS = 'input, textarea, select, [contenteditable="true"]';

const SCROLL_KEYS = new Set([
  'ArrowUp',
  'ArrowDown',
  'PageUp',
  'PageDown',
  'Home',
  'End',
  ' ',
]);

/**
 * @param {{
 *   speed?: number,
 *   resumeDelay?: number,
 *   onStatus?: (status: 'playing' | 'resuming' | 'paused' | 'finished') => void,
 * }} options
 */
export function createAutoScroller({
  speed = AUTO_SCROLL_SPEED,
  resumeDelay = AUTO_SCROLL_RESUME_DELAY,
  onStatus = () => {},
} = {}) {
  let raf = 0;
  let frame = 0;
  let last = 0;
  let position = 0;
  let maxScroll = 0;
  let running = false;
  let paused = true;
  let finished = false;
  let fieldFocused = false;
  let confirmationShown = false;
  let status = 'paused';
  let resumeTimer = 0;
  let resumingTimer = 0;
  const teardown = [];

  const setStatus = (next) => {
    if (status === next) return;
    status = next;
    onStatus(next);
  };

  const measure = () => {
    maxScroll = Math.max(
      0,
      document.documentElement.scrollHeight - window.innerHeight,
    );
  };

  const syncToPage = () => {
    position = window.scrollY;
    last = 0;
  };

  const stopLoop = () => {
    if (raf) window.cancelAnimationFrame(raf);
    raf = 0;
  };

  function pause() {
    if (!running || finished || paused) return;
    paused = true;
    last = 0;
    stopLoop();
    window.clearTimeout(resumingTimer);
    setStatus('paused');
  }

  function finish() {
    finished = true;
    stopLoop();
    window.clearTimeout(resumeTimer);
    window.clearTimeout(resumingTimer);
    setStatus('finished');
  }

  const step = (time) => {
    raf = 0;
    if (!running || paused || finished) return;

    if (last === 0) last = time;
    // Clamp the delta so a backgrounded tab cannot teleport the page.
    const delta = Math.min((time - last) / 1000, 0.1);
    last = time;
    frame += 1;

    if (frame % 15 === 0) {
      measure();
      confirmationShown = Boolean(document.querySelector('.rsvp__success'));
      // Safety net: a focused field holds the camera even if its focus event
      // never arrived (a background tab, or an event swallowed upstream).
      fieldFocused = Boolean(
        document.activeElement &&
          document.activeElement.matches?.(FORM_FIELDS),
      );
    }

    // Never scroll a reply's confirmation, or a focused field, out of view.
    if (fieldFocused || confirmationShown) {
      pause();
      return;
    }

    // If the page moved without this loop asking it to — a scrollbar drag, an
    // anchor jump, the browser restoring a position — adopt where the guest
    // actually is and hand control back, rather than dragging them backwards.
    // Wheel, touch and key input already pause on the event itself; this covers
    // the interactions that never reach the page (a scrollbar, for instance).
    if (Math.abs(window.scrollY - position) > 4) {
      syncToPage();
      pause();
      scheduleResume();
      return;
    }

    position = Math.min(position + delta * speed, maxScroll);

    if (position >= maxScroll) {
      window.scrollTo(0, maxScroll);
      finish();
      return;
    }

    window.scrollTo(0, position);
    raf = window.requestAnimationFrame(step);
  };

  function resume() {
    if (!running || finished) return;

    confirmationShown = Boolean(document.querySelector('.rsvp__success'));
    fieldFocused = Boolean(
      document.activeElement && document.activeElement.matches?.(FORM_FIELDS),
    );
    if (fieldFocused || confirmationShown) return;

    paused = false;
    syncToPage();
    setStatus('resuming');

    window.clearTimeout(resumingTimer);
    resumingTimer = window.setTimeout(() => {
      if (!paused && !finished) setStatus('playing');
    }, RESUMING_LABEL_DURATION);

    if (!raf) raf = window.requestAnimationFrame(step);
  }

  const scheduleResume = () => {
    window.clearTimeout(resumeTimer);
    if (!running || finished || fieldFocused) return;
    resumeTimer = window.setTimeout(() => {
      if (!fieldFocused) resume();
    }, resumeDelay);
  };

  const onInput = (event) => {
    if (!running || finished) return;
    // The indicator's own buttons are not page interaction.
    if (event.target instanceof Element && event.target.closest('.auto-scroll')) {
      return;
    }
    pause();
    scheduleResume();
  };

  const onKeyDown = (event) => {
    if (SCROLL_KEYS.has(event.key)) onInput(event);
  };

  const onFocusIn = (event) => {
    if (!(event.target instanceof Element)) return;
    if (!event.target.matches(FORM_FIELDS)) return;
    fieldFocused = true;
    window.clearTimeout(resumeTimer);
    pause();
  };

  const onFocusOut = (event) => {
    if (!(event.target instanceof Element)) return;
    if (!event.target.matches(FORM_FIELDS)) return;
    fieldFocused = false;
    scheduleResume();
  };

  const listen = (target, type, handler, options) => {
    target.addEventListener(type, handler, options);
    teardown.push(() => target.removeEventListener(type, handler, options));
  };

  return {
    start() {
      if (running || finished) return;
      running = true;
      measure();
      syncToPage();

      // Capture phase throughout: nothing on the page can swallow these, so a
      // guest's first wheel, touch, key or focus always reaches the camera.
      listen(window, 'wheel', onInput, { passive: true, capture: true });
      listen(window, 'touchstart', onInput, { passive: true, capture: true });
      listen(window, 'touchmove', onInput, { passive: true, capture: true });
      listen(window, 'pointerdown', onInput, { passive: true, capture: true });
      listen(window, 'keydown', onKeyDown, true);
      listen(document, 'focusin', onFocusIn, true);
      listen(document, 'focusout', onFocusOut, true);

      paused = false;
      setStatus('playing');
      raf = window.requestAnimationFrame(step);
    },

    toggle() {
      if (!running || finished) return;
      window.clearTimeout(resumeTimer);
      if (paused) resume();
      else pause();
    },

    pause,
    resume,

    destroy() {
      running = false;
      stopLoop();
      window.clearTimeout(resumeTimer);
      window.clearTimeout(resumingTimer);
      while (teardown.length) {
        const off = teardown.pop();
        if (off) off();
      }
    },
  };
}

