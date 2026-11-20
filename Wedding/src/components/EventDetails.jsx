import { hasDetails, wedding } from '../config/wedding.js';

/**
 * A logistics block for the wedding itself or for one event.
 *
 * Every row renders only when its value exists on the given source, so while
 * details are unconfirmed the block renders nothing at all — no blank rows, no
 * "TBD", no placeholder text. Fill a field in and the matching row appears.
 *
 * @param {{
 *   source?: object,
 *   className?: string,
 * }} props `source` defaults to the wedding configuration
 */
export default function EventDetails({ source = wedding, className = '' }) {
  if (!hasDetails(source)) return null;

  return (
    <dl className={`details${className ? ` ${className}` : ''}`}>
      {source.dateLabel && (
        <div className="details__item">
          <dt className="details__label">The Day</dt>
          <dd className="details__value">{source.dateLabel}</dd>
        </div>
      )}
      {source.timeLabel && (
        <div className="details__item">
          <dt className="details__label">The Hour</dt>
          <dd className="details__value">{source.timeLabel}</dd>
        </div>
      )}
      {source.venueName && (
        <div className="details__item">
          <dt className="details__label">The Place</dt>
          <dd className="details__value">{source.venueName}</dd>
        </div>
      )}
      {source.venueLocation && (
        <div className="details__item">
          <dt className="details__label">Location</dt>
          <dd className="details__value">{source.venueLocation}</dd>
        </div>
      )}
      {source.venueAddress && (
        <div className="details__item">
          <dt className="details__label">Address</dt>
          <dd className="details__value">{source.venueAddress}</dd>
        </div>
      )}
    </dl>
  );
}
