import { useRef, useState } from 'react';
import { ArrowRight } from 'lucide-react';

import { isValidEmail } from '../config/rsvpApi.js';

const PARTY_SIZES = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];

/**
 * The attendee details for an acceptance.
 *
 * It owns only its fields; the surrounding flow (which reply was chosen, what
 * happens on submit) belongs to `RSVPSection`. Validation runs on submit rather
 * than on every keystroke, and any error is announced and then cleared as soon
 * as the guest starts correcting it.
 *
 * @param {{
 *   onSubmit: (values: { name: string, partySize: number, message: string, email: string }) => void,
 *   busy?: boolean,
 * }} props
 */
export default function RSVPForm({ onSubmit, busy = false }) {
  const [name, setName] = useState('');
  const [partySize, setPartySize] = useState('1');
  const [message, setMessage] = useState('');
  // Optional: a reply is complete without it, so this can stay empty forever.
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [emailError, setEmailError] = useState('');
  const nameRef = useRef(null);
  const emailRef = useRef(null);

  const handleSubmit = (event) => {
    event.preventDefault();
    if (busy) return;

    const trimmedName = name.trim();
    if (!trimmedName) {
      setError('Please add your name so we know who is replying.');
      nameRef.current?.focus();
      return;
    }
    setError('');

    // Only a supplied address is held to the format; empty is always fine.
    const trimmedEmail = email.trim();
    if (!isValidEmail(trimmedEmail)) {
      setEmailError('That address does not look quite right.');
      emailRef.current?.focus();
      return;
    }
    setEmailError('');

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
        <legend className="rsvp__visually-hidden">Your reply details</legend>

        <div className="rsvp__field">
          <label className="rsvp__field-label" htmlFor="rsvp-name">
            Your name
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
              if (error) setError('');
            }}
            aria-invalid={error ? 'true' : undefined}
            aria-describedby={error ? 'rsvp-name-error' : undefined}
            placeholder="As we should address you"
            required
          />
          {error ? (
            <p className="rsvp__error" id="rsvp-name-error" role="alert">
              {error}
            </p>
          ) : null}
        </div>

        <div className="rsvp__field">
          <label className="rsvp__field-label" htmlFor="rsvp-party">
            Guests joining you
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
            Email Address
            <span className="rsvp__optional">optional</span>
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
              if (emailError) setEmailError('');
            }}
            aria-invalid={emailError ? 'true' : undefined}
            aria-describedby={emailError ? 'rsvp-email-error' : 'rsvp-email-hint'}
            placeholder="Where we can send a confirmation, if you wish"
          />
          {emailError ? (
            <p className="rsvp__error" id="rsvp-email-error" role="alert">
              {emailError}
            </p>
          ) : (
            <p className="rsvp__hint" id="rsvp-email-hint">
              Leave this blank and your reply is still complete.
            </p>
          )}
        </div>

        <div className="rsvp__field rsvp__field--wide">
          <label className="rsvp__field-label" htmlFor="rsvp-message">
            A note for the couple
            <span className="rsvp__optional">optional</span>
          </label>
          <textarea
            id="rsvp-message"
            className="rsvp__textarea"
            name="message"
            rows={3}
            maxLength={400}
            value={message}
            onChange={(event) => setMessage(event.target.value)}
            placeholder="Share a wish, a blessing or a memory"
          />
        </div>
      </fieldset>

      <div className="rsvp__actions">
        <button className="rsvp__submit" type="submit" disabled={busy}>
          <span>{busy ? 'Sending your reply' : 'Send our reply'}</span>
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
