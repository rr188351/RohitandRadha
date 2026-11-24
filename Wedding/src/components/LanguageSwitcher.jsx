import { useEffect, useRef, useState } from 'react';
import { ChevronDown, Languages } from 'lucide-react';

import { useI18n } from '../i18n/index.jsx';

/**
 * The invitation's language switcher.
 *
 * A small glass pill in the top-left corner, inside the gold frame, showing the
 * language the invitation is currently in. Pressing it opens a short menu of the
 * three languages; choosing one re-renders the page in place (see
 * `src/i18n/index.jsx`) - nothing reloads, so the music keeps playing, the RSVP
 * form keeps what the guest typed, and the page does not jump.
 *
 * It behaves like a real menu: `aria-haspopup="menu"` and `aria-expanded` on the
 * trigger, `role="menuitemradio"` with `aria-checked` on each language, the arrow
 * keys (plus Home/End) to move between them, Escape to close and hand focus back
 * to the trigger, and any click outside to dismiss.
 *
 * Each language's own name is written in its own script and tagged with its own
 * `lang` attribute, so the browser picks the right font and shaping for it
 * whatever the rest of the page is in.
 */
export default function LanguageSwitcher() {
  const { code, languages, setLanguage, ui } = useI18n();
  const [open, setOpen] = useState(false);
  const rootRef = useRef(null);
  const toggleRef = useRef(null);
  const itemRefs = useRef([]);

  const current = languages.find((language) => language.code === code) ?? languages[0];

  // Dismissal: a press anywhere else, or Escape.
  useEffect(() => {
    if (!open) return undefined;

    const onPointerDown = (event) => {
      if (!rootRef.current?.contains(event.target)) setOpen(false);
    };
    const onKeyDown = (event) => {
      if (event.key !== 'Escape') return;
      setOpen(false);
      toggleRef.current?.focus();
    };

    document.addEventListener('pointerdown', onPointerDown);
    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('pointerdown', onPointerDown);
      document.removeEventListener('keydown', onKeyDown);
    };
  }, [open]);

  // Opening puts the keyboard on the language in use, not on the first one.
  useEffect(() => {
    if (!open) return undefined;
    const index = languages.findIndex((language) => language.code === code);
    const frame = window.requestAnimationFrame(() => {
      itemRefs.current[index >= 0 ? index : 0]?.focus();
    });
    return () => window.cancelAnimationFrame(frame);
  }, [open, code, languages]);

  const focusItem = (index) => {
    const bounded = (index + languages.length) % languages.length;
    itemRefs.current[bounded]?.focus();
  };

  const onItemKeyDown = (event, index) => {
    if (event.key === 'ArrowDown') {
      event.preventDefault();
      focusItem(index + 1);
    } else if (event.key === 'ArrowUp') {
      event.preventDefault();
      focusItem(index - 1);
    } else if (event.key === 'Home') {
      event.preventDefault();
      focusItem(0);
    } else if (event.key === 'End') {
      event.preventDefault();
      focusItem(languages.length - 1);
    }
  };

  const choose = (next) => {
    setLanguage(next);
    setOpen(false);
    toggleRef.current?.focus();
  };

  return (
    <div className={`lang${open ? ' is-open' : ''}`} ref={rootRef}>
      <button
        className="lang__toggle"
        type="button"
        ref={toggleRef}
        onClick={() => setOpen((value) => !value)}
        onKeyDown={(event) => {
          if (event.key === 'ArrowDown') {
            event.preventDefault();
            setOpen(true);
          }
        }}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label={`${ui.switcher.label}: ${current.native}`}
        title={ui.switcher.choose}
      >
        <Languages className="lang__icon" size={13} strokeWidth={1.6} aria-hidden="true" />
        <span className="lang__current" lang={current.code}>
          {current.native}
        </span>
        <ChevronDown className="lang__chev" size={12} strokeWidth={1.8} aria-hidden="true" />
      </button>

      {open ? (
        <div className="lang__menu" role="menu" aria-label={ui.switcher.choose}>
          {languages.map((language, index) => (
            <button
              key={language.code}
              className="lang__item"
              type="button"
              role="menuitemradio"
              aria-checked={language.code === code}
              lang={language.code}
              ref={(node) => {
                itemRefs.current[index] = node;
              }}
              onClick={() => choose(language.code)}
              onKeyDown={(event) => onItemKeyDown(event, index)}
            >
              <span className="lang__dot" aria-hidden="true" />
              <span>{language.native}</span>
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
}
