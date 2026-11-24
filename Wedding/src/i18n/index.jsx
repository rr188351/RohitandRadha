/**
 * The invitation's language layer.
 *
 * HOW IT WORKS
 * ------------
 * `en.js` is the complete English tree (composed from the existing wedding and
 * gallery configs plus the strings that used to be inline in components). `hi.js`
 * and `bho.js` are OVERLAYS: they carry only what they translate, and everything
 * they leave out falls back to English. A string can therefore never render as an
 * empty gap just because one language has not caught up yet.
 *
 * Components read the merged tree through `useI18n()`, so no component contains a
 * single language conditional - a component asks for `wedding.rsvp.accept.label`
 * and gets the right language's words.
 *
 * The choice is remembered in localStorage and restored on the next visit; an
 * unknown or unreadable value falls back to English rather than breaking the page.
 * Switching language re-renders text in place: nothing is remounted, so the
 * music keeps playing, the RSVP form keeps what the guest typed, and the page
 * does not scroll.
 */

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';

import { en } from './en.js';
import { hi } from './hi.js';
import { bho } from './bho.js';

/** English is the default for a first-time visitor. */
export const DEFAULT_LANGUAGE = 'en';

/** Where the guest's choice is remembered. */
export const LANGUAGE_STORAGE_KEY = 'wedding.language';

/**
 * Every language the invitation can be read in. `native` is what the switcher
 * shows (a guest looking for their own language should see it written the way
 * they write it); `label` is the English name, used for the accessible label.
 */
export const LANGUAGES = [
  { code: 'en', label: 'English', native: 'English', dict: en },
  { code: 'hi', label: 'Hindi', native: 'हिंदी', dict: hi },
  { code: 'bho', label: 'Bhojpuri', native: 'भोजपुरी', dict: bho },
];

/** Just what a switcher needs: no dictionaries, no internals. */
export const languageOptions = LANGUAGES.map(({ code, label, native }) => ({
  code,
  label,
  native,
}));

const isPlainObject = (value) =>
  typeof value === 'object' && value !== null && !Array.isArray(value);

/**
 * Deep merge, array-by-array.
 *
 * Arrays are merged INDEX-WISE rather than replaced: the event list and the
 * gallery list carry their (English) factual fields beside their translated
 * words, and replacing an array wholesale would drop fields such as a future
 * date or venue. Only the fields an overlay actually names are overwritten.
 */
function mergeDeep(base, overlay) {
  if (overlay === undefined) return base;
  if (Array.isArray(base) || Array.isArray(overlay)) {
    if (!Array.isArray(base) || !Array.isArray(overlay)) return overlay;
    const merged = base.slice();
    overlay.forEach((item, index) => {
      merged[index] = mergeDeep(base[index], item);
    });
    return merged;
  }
  if (isPlainObject(base) && isPlainObject(overlay)) {
    const merged = { ...base };
    for (const [key, value] of Object.entries(overlay)) {
      merged[key] = mergeDeep(base[key], value);
    }
    return merged;
  }
  return overlay;
}

/**
 * Replaces `{tokens}` in every string of a tree.
 *
 * Used for the couple's names, which are never translated: `{couple}` becomes
 * their names exactly as the configuration writes them, in whichever language
 * has used the token.
 */
function resolveTokens(value, tokens) {
  if (typeof value === 'string') {
    let out = value;
    for (const [token, replacement] of Object.entries(tokens)) {
      out = out.split(`{${token}}`).join(replacement);
    }
    return out;
  }
  if (Array.isArray(value)) return value.map((item) => resolveTokens(item, tokens));
  if (isPlainObject(value)) {
    const out = {};
    for (const [key, item] of Object.entries(value)) {
      out[key] = resolveTokens(item, tokens);
    }
    return out;
  }
  return value;
}

/** `{count}`-style substitution for values only known at render time. */
export function format(template, values = {}) {
  if (typeof template !== 'string') return template ?? '';
  return template.replace(/\{(\w+)\}/g, (match, key) =>
    Object.prototype.hasOwnProperty.call(values, key) ? String(values[key]) : match,
  );
}

/** The safe way to read a remembered choice: anything unknown means English. */
function readStoredLanguage() {
  try {
    const saved = window.localStorage.getItem(LANGUAGE_STORAGE_KEY);
    if (saved && LANGUAGES.some((language) => language.code === saved)) return saved;
  } catch {
    // Private mode, or storage disabled: the invitation simply opens in English.
  }
  return DEFAULT_LANGUAGE;
}

const I18nContext = createContext(null);

/**
 * Holds the chosen language and hands every component the merged dictionary.
 *
 * @param {{ children: import('react').ReactNode }} props
 */
export function LanguageProvider({ children }) {
  const [code, setLanguage] = useState(readStoredLanguage);

  // The page's own language attribute follows the choice, so screen readers and
  // the browser's font fallback both know which script to expect.
  useEffect(() => {
    try {
      window.localStorage.setItem(LANGUAGE_STORAGE_KEY, code);
    } catch {
      // A guest without storage still gets the language for this visit.
    }
    document.documentElement.lang = code;
  }, [code]);

  const value = useMemo(() => {
    const language = LANGUAGES.find((entry) => entry.code === code) || LANGUAGES[0];
    const merged = language.code === DEFAULT_LANGUAGE ? en : mergeDeep(en, language.dict);
    const dictionary = resolveTokens(merged, {
      couple: `${en.wedding.names.first} & ${en.wedding.names.second}`,
    });

    return {
      /** The chosen language. */
      code: language.code,
      /** Change the language: the page re-renders in place, nothing reloads. */
      setLanguage,
      /** Every language the switcher offers. */
      languages: languageOptions,
      /** The merged dictionary, ready to read. */
      ...dictionary,
      /** A dotted lookup for one-off strings. */
      t: (path, fallback = '') =>
        String(path)
          .split('.')
          .reduce((node, key) => (node == null ? node : node[key]), dictionary) ?? fallback,
      format,
    };
  }, [code]);

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

/** The dictionary, the current language and the way to change it. */
export function useI18n() {
  const context = useContext(I18nContext);
  if (!context) {
    throw new Error('useI18n() must be used inside a <LanguageProvider>.');
  }
  return context;
}

export default LanguageProvider;
