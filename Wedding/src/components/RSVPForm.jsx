import { useRef, useState } from 'react';
import { ArrowRight } from 'lucide-react';

import { isValidEmail } from '../config/rsvpApi.js';
import { useI18n } from '../i18n/index.jsx';

/** Every party size the invitation offers: one to twelve guests. */
const PARTY_SIZES = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];

/**
 * The attendee details for an acceptance.
 *
 * It owns only its fields; the surrounding flow (which reply was chosen, what
 * happens on submit) belongs to `RSVPSection`. Validation runs on submit rather
 * than on every keystroke, and any error is announced and then cleared as soon
 * as the guest starts correcting it.
 *
 * Every label, placeholder and error message comes from the dictionary, and the
 * error is held as a KEY rather than as a sentence - so if the guest changes the
 * language while an error is showing, the message changes with it.
 *
 * @param {{
 *   onSubmit: (values: { name: string, partySize: number, message: string, email: string }) => void,
 *   busy?: boolean,
 * }} props
 */
export default function RSVPForm({ onSubmit, busy = false }) {
  const { ui } = useI18n();
  const form = ui.rsvpForm;

  const [name, setName] = useState('');
  const [partySize, setPartySize] = useState('1');
  const [message, setMessage] = useState('');
  // Optional: a reply is complete without it, so this can stay empty forever.
  const [email, setEmail] = useState('');
  const [errorKey, setErrorKey] = useState('');
  const [emailErrorKey, setEmailErrorKey] = useState('');
  const nameRef = useRef(null);
  const emailRef = useRef(null);

  const handleSubmit = (event) => {
    event.preventDefault();
    if (busy) return;

    const trimmedName = name.trim();
    if (!trimmedName) {
      setErrorKey('nameRequired');
      nameRef.current?.focus();
      return;
    }
    setErrorKey('');

    // Only a supplied address is held to the format; empty is always fine.
    const trimmedEmail = email.trim();
    if (!isValidEmail(trimmedEmail)) {
      setEmailErrorKey('emailInvalid');
      emailRef.current?.focus();
      return;
    }
    setEmailErrorKey('');

    onSubmit({
      name: trimmedName,
      partySize: Number(partySize),
      message: message.trim(),
      email: trimmedEmail,
    });
  };

  return (
    <form className="rsvp__form" onSubmit={handleSubmit} noValidate>
      <fieldset className="rsvp__fields" disabled={busy} aria-busy={busy}>
        <legend className="rsvp__visually-hidden">{form.legend}</legend>

        <div className="rsvp__field">
          <label className="rsvp__field-label" htmlFor="rsvp-name">
            {form.name}
          </label>
          <input
            id="rsvp-name"
            ref={nameRef}
            className="rsvp__input"
            type="text"
            name="name"
            autoComplete="name"
            value={name}
            onChange={(event) => {
              setName(event.target.value);
              if (errorKey) setErrorKey('');
            }}
            aria-invalid={errorKey ? 'true' : undefined}
            aria-describedby={errorKey ? 'rsvp-name-error' : undefined}
            placeholder={form.namePlaceholder}
            required
          />
          {errorKey ? (
            <p className="rsvp__error" id="rsvp-name-error" role="alert">
              {form[errorKey]}
            </p>
          ) : null}
        </div>

        <div className="rsvp__field">
          <label className="rsvp__field-label" htmlFor="rsvp-party">
            {form.guests}
          </label>
          <select
            id="rsvp-party"
            className="rsvp__select"
            name="partySize"
            value={partySize}
            onChange={(event) => setPartySize(event.target.value)}
          >
            {PARTY_SIZES.map((size) => (
              <option key={size} value={size}>
                {size}
              </option>
            ))}
          </select>
        </div>

        <div className="rsvp__field rsvp__field--wide">
          <label className="rsvp__field-label" htmlFor="rsvp-email">
            {form.email}
            <span className="rsvp__optional">{form.optional}</span>
          </label>
          <input
            id="rsvp-email"
            ref={emailRef}
            className="rsvp__input"
            type="email"
            name="email"
            inputMode="email"
            autoComplete="email"
            maxLength={254}
            value={email}
            onChange={(event) => {
              setEmail(event.target.value);
              if (emailErrorKey) setEmailErrorKey('');
            }}
            aria-invalid={emailErrorKey ? 'true' : undefined}
            aria-describedby={emailErrorKey ? 'rsvp-email-error' : 'rsvp-email-hint'}
            placeholder={form.emailPlaceholder}
          />
          {emailErrorKey ? (
            <p className="rsvp__error" id="rsvp-email-error" role="alert">
              {form[emailErrorKey]}
            </p>
          ) : (
            <p className="rsvp__hint" id="rsvp-email-hint">
              {form.emailHint}
            </p>
          )}
        </div>

        <div className="rsvp__field rsvp__field--wide">
          <label className="rsvp__field-label" htmlFor="rsvp-message">
            {form.note}
            <span className="rsvp__optional">{form.optional}</span>
          </label>
          <textarea
            id="rsvp-message"
            className="rsvp__textarea"
            name="message"
            rows={3}
            maxLength={400}
            value={message}
            onChange={(event) => setMessage(event.target.value)}
            placeholder={form.notePlaceholder}
          />
        </div>
      </fieldset>

      <div className="rsvp__actions">
        <button className="rsvp__submit" type="submit" disabled={busy}>
          <span>{busy ? form.submitting : form.submit}</span>
          <ArrowRight
            className="rsvp__submit-icon"
            size={16}
            strokeWidth={1.5}
            aria-hidden="true"
          />
        </button>
      </div>
    </form>
  );
}
