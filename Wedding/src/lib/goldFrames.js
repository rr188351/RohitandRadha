/**
 * One observer for every gold frame on the page.
 *
 * A frame only lights up the first time its card actually reaches the guest —
 * that is what makes the border read as part of the card's entrance instead of
 * a decoration that was already finished before it was seen. Rather than a
 * ScrollTrigger (or an observer) per card, every frame registers with this
 * single instance, and each is forgotten the moment it has ignited, so nothing
 * keeps observing a page that has already been read.
 *
 * The class it adds is all the CSS needs: `is-ignited` runs the one-shot bloom
 * and releases the travelling beams. Browsers without IntersectionObserver
 * simply get the settled frame immediately.
 */
let observer = null;

function ensureObserver() {
  if (observer) return observer;
  if (typeof IntersectionObserver === 'undefined') return null;

  observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('is-ignited');
        observer.unobserve(entry.target);
      });
    },
    // A little short of the bottom edge, so the bloom plays while the card is
    // properly on screen and alongside its own reveal.
    { rootMargin: '0px 0px -12% 0px', threshold: 0.01 },
  );

  return observer;
}

/**
 * Starts watching a frame.
 *
 * @param {Element | null} element the frame layer
 * @returns {() => void} stops watching it
 */
export function registerGoldFrame(element) {
  if (!element) return () => {};

  const instance = ensureObserver();

  if (!instance) {
    element.classList.add('is-ignited');
    return () => {};
  }

  /**
   * A frame that is already on screen — the opening card, the music pill, the
   * hero — cannot wait for a scroll that may never come (the pill is fixed in
   * the corner and sits inside the observer's bottom margin), so it blooms on
   * a short beat instead. The beat is what makes it land *with* the card's own
   * entrance rather than before it.
   */
  const box = element.getBoundingClientRect();
  const onScreen = box.width > 0 && box.bottom > 0 && box.top < window.innerHeight;

  if (onScreen) {
    const timer = window.setTimeout(() => {
      element.classList.add('is-ignited');
    }, 420);

    return () => window.clearTimeout(timer);
  }

  instance.observe(element);

  return () => instance.unobserve(element);
}
