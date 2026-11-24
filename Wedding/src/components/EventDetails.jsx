import { hasDetails } from '../config/wedding.js';
import { useI18n } from '../i18n/index.jsx';

/**
 * A logistics block for the wedding itself or for one event.
 *
 * Every row renders only when its value exists on the given source, so while
 * details are unconfirmed the block renders nothing at all — no blank rows, no
 * "TBD", no placeholder text. Fill a field in and the matching row appears.
 *
 * The row labels come from the dictionary (so they read correctly in Hindi and
 * Bhojpuri); the values themselves are whatever the configuration holds.
 *
 * @param {{
 *   source?: object,
 *   className?: string,
 * }} props `source` defaults to the wedding configuration
 */
export default function EventDetails({ source, className = '' }) {
  const { wedding, ui } = useI18n();
  const details = source ?? wedding;

  if (!hasDetails(details)) return null;

  return (
    <dl className={`details${className ? ` ${className}` : ''}`}>
      {details.dateLabel && (
        <div className="details__item">
          <dt className="details__label">{ui.details.day}</dt>
          <dd className="details__value">{details.dateLabel}</dd>
        </div>
      )}
      {details.timeLabel && (
        <div className="details__item">
          <dt className="details__label">{ui.details.hour}</dt>
          <dd className="details__value">{details.timeLabel}</dd>
        </div>
      )}
      {details.venueName && (
        <div className="details__item">
          <dt className="details__label">{ui.details.place}</dt>
          <dd className="details__value">{details.venueName}</dd>
        </div>
      )}
      {details.venueLocation && (
        <div className="details__item">
          <dt className="details__label">{ui.details.location}</dt>
          <dd className="details__value">{details.venueLocation}</dd>
        </div>
      )}
      {details.venueAddress && (
        <div className="details__item">
          <dt className="details__label">{ui.details.address}</dt>
          <dd className="details__value">{details.venueAddress}</dd>
        </div>
      )}
    </dl>
  );
}
