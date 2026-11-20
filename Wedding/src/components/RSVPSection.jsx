import { useCallback, useLayoutEffect, useRef, useState } from 'react';
import { ArrowRight } from 'lucide-react';

import { gsap } from '../lib/gsap';
import { cinematicOnPhones, revealStart } from '../lib/reveal.js';
import { wedding } from '../config/wedding.js';
import { CornerOrnament, Divider } from './Ornaments.jsx';
import RSVPForm from './RSVPForm.jsx';

const CORNERS = ['tl', 'tr', 'br', 'bl'];
const OPTIONS = ['accept', 'decline'];

/**
 * Phase 07 — the RSVP.
 *
 * The final personal gesture of the invitation. Nothing is transmitted: see
 * `submitReply` below, which is the single seam where a real RSVP service would
 * be called. The rest of the flow — busy, failure and success — is already
 * shaped to handle an asynchronous submission, so wiring a backend later needs
 * no redesign.
 *
 * Scroll reveals are `once` ScrollTriggers and each state change unfolds the
 * panel body rather than snapping. With `prefers-reduced-motion` the section
 * renders in its final state and every transition is skipped.
 */
export default function RSVPSection() {
  const rootRef = useRef(null);
  const bodyRef = useRef(null);
  const firstBodyPaint = useRef(true);

  const [choice, setChoice] = useState(null); // null | 'accept' | 'decline'
  const [status, setStatus] = useState('editing'); // editing | submitting | done | error
  const [reply, setReply] = useState(null);
  const [declineNote, setDeclineNote] = useState('');

  // --- Scroll reveals, fired once as the section arrives ---
  useLayoutEffect(() => {
    const root = rootRef.current;
    if (!root) return undefined;

    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      return undefined;
    }

    const ctx = gsap.context(() => {
      const find = (selector) => gsap.utils.toArray(selector, root);

      const header = root.querySelector('.rsvp__header');
      const eyebrow = find('.rsvp__eyebrow');
      const rule = find('.rsvp__rule');
      const titleLines = find('.rsvp__title-inner');
      const intro = find('.rsvp__intro');
      const panel = find('.rsvp__panel');
      const halo = find('.rsvp__halo');
      const corners = find('.rsvp__corners .corner__art');
      const options = find('.rsvp__option');

      const tl = gsap
        .timeline({
          defaults: { ease: 'power2.out' },
          scrollTrigger: { trigger: header, start: revealStart(84), once: true },
        })
        .fromTo(
          eyebrow,
          { opacity: 0, y: 14 },
          { opacity: 1, y: 0, duration: 0.8 },
          0,
        )
        .fromTo(
          rule,
          { opacity: 0, scaleX: 0.4 },
          { opacity: 1, scaleX: 1, duration: 0.9, transformOrigin: 'center' },
          0.1,
        )
        .fromTo(
          titleLines,
          { yPercent: 112, opacity: 0 },
          {
            yPercent: 0,
            opacity: 1,
            duration: 1.05,
            stagger: 0.12,
            ease: 'power3.out',
          },
          0.3,
        )
        .fromTo(
          intro,
          { opacity: 0, y: 16 },
          { opacity: 1, y: 0, duration: 0.9 },
          0.7,
        );

      cinematicOnPhones(tl);

      const panelTl = gsap
        .timeline({
          defaults: { ease: 'power2.out' },
          scrollTrigger: { trigger: panel, start: revealStart(84), once: true },
        })
        .fromTo(
          panel,
          { opacity: 0, y: 40 },
          { opacity: 1, y: 0, duration: 1.2 },
          0,
        )
        .fromTo(
          halo,
          { opacity: 0, scale: 0.9 },
          { opacity: 1, scale: 1, duration: 1.4, transformOrigin: 'center' },
          0,
        )
        .fromTo(
          corners,
          { opacity: 0, scale: 0.74 },
          {
            opacity: 0.5,
            scale: 1,
            duration: 1,
            stagger: 0.06,
            transformOrigin: 'center',
          },
          0.25,
        )
        .fromTo(
          options,
          { opacity: 0, y: 18 },
          { opacity: 1, y: 0, duration: 0.9, stagger: 0.12 },
          0.5,
        );

      cinematicOnPhones(panelTl);
    }, root);

    return () => ctx.revert();
  }, []);

  // --- The panel body unfolds whenever the reply state changes ---
  useLayoutEffect(() => {
    // The first paint is already resting, so it needs no tween.
    if (firstBodyPaint.current) {
      firstBodyPaint.current = false;
      return undefined;
    }

    const body = bodyRef.current;
    if (!body) return undefined;

    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      return undefined;
    }

    // Height is measured from `auto` so the body always fits its content; both
    // inline properties are cleared afterwards to leave it responsive.
    const tween = gsap.fromTo(
      body,
      { height: 0, opacity: 0, overflow: 'hidden' },
      {
        height: 'auto',
        opacity: 1,
        duration: 0.7,
        ease: 'power2.out',
        clearProps: 'height,overflow',
      },
    );

    return () => tween.kill();
  }, [choice, status]);

  /**
   * The one seam between this UI and a real RSVP service.
   *
   * No backend is configured yet, so this resolves immediately and nothing
   * leaves the browser. To connect one later, POST `payload` here:
   *
   *   await fetch(YOUR_ENDPOINT, {
   *     method: 'POST',
   *     headers: { 'Content-Type': 'application/json' },
   *     body: JSON.stringify(payload),
   *   });
   *
   * The flow below already copes with a slow or failing request, so nothing
   * else has to change.
   */
  const submitReply = useCallback(async (payload) => Promise.resolve(payload), []);

  const handleSubmit = useCallback(
    async (values) => {
      // One reply per guest: ignore anything that arrives while a reply is in
      // flight, or after it has already been accepted.
      if (status === 'submitting' || status === 'done') return;

      setStatus('submitting');

      const payload = {
        attendance: choice,
        name: values.name ?? '',
        partySize: values.partySize ?? 0,
        message: values.message ?? '',
        capturedAt: new Date().toISOString(),
      };

      try {
        await submitReply(payload);
        setReply(payload);
        setStatus('done');
      } catch {
        setStatus('error');
      }
    },
    [choice, status, submitReply],
  );

  const handleChoose = useCallback((value) => {
    setChoice(value);
    setStatus('editing');
    setReply(null);
  }, []);

  const handleChangeReply = useCallback(() => {
    setChoice(null);
    setStatus('editing');
    setReply(null);
    setDeclineNote('');
  }, []);

  const { rsvp } = wedding;

  return (
    <section className="rsvp" ref={rootRef} aria-labelledby="rsvp-title">
      <header className="rsvp__header">
        <p className="rsvp__eyebrow">{rsvp.eyebrow}</p>

        <Divider className="rsvp__rule" />

        <h2 className="rsvp__title" id="rsvp-title">
          <span className="rsvp__title-mask">
            <span className="rsvp__title-inner">{rsvp.titleLead}</span>
          </span>{' '}
          <span className="rsvp__title-mask">
            <span className="rsvp__title-inner">{rsvp.titleAccent}</span>
          </span>
        </h2>

        <p className="rsvp__intro">{rsvp.intro}</p>
      </header>

      <div className="rsvp__stage">
        <span className="rsvp__halo" aria-hidden="true" />

        <article className="rsvp__panel glass glass--panel">
          <span className="glass-grain" aria-hidden="true" />

          <div className="rsvp__corners" aria-hidden="true">
            {CORNERS.map((position) => (
              <CornerOrnament
                key={position}
                position={position}
                className="rsvp__corner"
              />
            ))}
          </div>

          <div className="rsvp__inner">
            {status !== 'done' ? (
              <fieldset className="rsvp__choice">
                <legend className="rsvp__visually-hidden">
                  Will you be joining us?
                </legend>

                {OPTIONS.map((value) => (
                  <label
                    key={value}
                    className={`rsvp__option rsvp__option--${value}`}
                  >
                    <input
                      className="rsvp__option-input"
                      type="radio"
                      name="rsvp-attendance"
                      value={value}
                      checked={choice === value}
                      onChange={() => handleChoose(value)}
                    />

                    <span className="rsvp__option-seal" aria-hidden="true" />

                    <span className="rsvp__option-label">
                      {rsvp[value].label}
                    </span>

                    <span className="rsvp__option-note">{rsvp[value].note}</span>
                  </label>
                ))}
              </fieldset>
            ) : null}

            <div className="rsvp__body" ref={bodyRef}>
              {status === 'error' ? (
                <p className="rsvp__error" role="alert">
                  Something interrupted your reply. Please try again.
                </p>
              ) : null}

              {status === 'done' && reply ? (
                <div className="rsvp__success" role="status">
                  <span className="rsvp__success-mark" aria-hidden="true" />

                  <p className="rsvp__success-title">
                    Thank you, {reply.name || 'dear guest'}.
                  </p>

                  <p className="rsvp__success-lede">
                    {reply.attendance === 'accept'
                      ? rsvp.accept.confirm
                      : rsvp.decline.message}
                  </p>

                  {reply.attendance === 'accept' && reply.partySize > 1 ? (
                    <p className="rsvp__success-detail">
                      We have noted a party of {reply.partySize}.
                    </p>
                  ) : null}

                  {reply.message ? (
                    <blockquote className="rsvp__success-quote">
                      {reply.message}
                    </blockquote>
                  ) : null}

                  <p className="rsvp__success-note">
                    Nothing has been sent or stored — this is a front-end
                    demonstration.
                  </p>

                  <button
                    className="rsvp__change"
                    type="button"
                    onClick={handleChangeReply}
                  >
                    Change my reply
                  </button>
                </div>
              ) : null}

              {status !== 'done' && choice === 'accept' ? (
                <RSVPForm
                  onSubmit={handleSubmit}
                  busy={status === 'submitting'}
                />
              ) : null}

              {status !== 'done' && choice === 'decline' ? (
                <div className="rsvp__decline">
                  <p className="rsvp__decline-copy">{rsvp.decline.message}</p>

                  <div className="rsvp__field">
                    <label
                      className="rsvp__field-label"
                      htmlFor="rsvp-decline-note"
                    >
                      A note for the couple
                      <span className="rsvp__optional">optional</span>
                    </label>
                    <textarea
                      id="rsvp-decline-note"
                      className="rsvp__textarea"
                      name="note"
                      rows={3}
                      maxLength={300}
                      value={declineNote}
                      onChange={(event) => setDeclineNote(event.target.value)}
                      placeholder="Share a wish or a blessing"
                    />
                  </div>

                  <div className="rsvp__actions">
                    <button
                      className="rsvp__submit"
                      type="button"
                      disabled={status === 'submitting'}
                      onClick={() =>
                        handleSubmit({
                          name: '',
                          partySize: 0,
                          message: declineNote.trim(),
                        })
                      }
                    >
                      <span>Send our reply</span>
                      <ArrowRight
                        className="rsvp__submit-icon"
                        size={16}
                        strokeWidth={1.5}
                        aria-hidden="true"
                      />
                    </button>
                  </div>
                </div>
              ) : null}
            </div>

            {status !== 'done' ? (
              <p className="rsvp__demo-note">{rsvp.demoNote}</p>
            ) : null}
          </div>
        </article>
      </div>
    </section>
  );
}
