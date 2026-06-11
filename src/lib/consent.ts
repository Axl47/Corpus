/**
 * Cookie-consent helpers (geo-aware opt-in model).
 *
 * Model: EU/EEA + UK visitors must opt IN before any analytics cookies/events
 * (GDPR + ePrivacy). Everyone else is opted in by default and gets an
 * informational notice they can dismiss (and may opt out later).
 *
 * Geo is detected server-side from Vercel's `x-vercel-ip-country` header — no
 * client-side IP lookup needed. Missing header (local dev, Tauri/Capacitor,
 * non-Vercel hosts) => treated as NOT required (safe, capture-on default).
 */

export const CONSENT_COOKIE = 'cookie-consent';
/** 12 months, in seconds — standard consent lifetime. */
export const CONSENT_COOKIE_MAX_AGE = 60 * 60 * 24 * 365;

export type ConsentValue = 'accepted' | 'rejected';

/**
 * EU/EEA member states + UK (ISO 3166-1 alpha-2). These are the jurisdictions
 * where prior opt-in consent for analytics cookies is legally required.
 */
const CONSENT_REQUIRED_COUNTRIES = new Set<string>([
  // EU
  'AT', 'BE', 'BG', 'HR', 'CY', 'CZ', 'DK', 'EE', 'FI', 'FR', 'DE', 'GR',
  'HU', 'IE', 'IT', 'LV', 'LT', 'LU', 'MT', 'NL', 'PL', 'PT', 'RO', 'SK',
  'SI', 'ES', 'SE',
  // EEA (non-EU)
  'IS', 'LI', 'NO',
  // UK
  'GB',
]);

/** True when the visitor's country requires prior opt-in consent. */
export function isConsentRequired(country: string | null | undefined): boolean {
  if (!country) return false;
  return CONSENT_REQUIRED_COUNTRIES.has(country.toUpperCase());
}

/** Narrow an arbitrary cookie string to a valid ConsentValue (or null). */
export function parseConsent(value: string | null | undefined): ConsentValue | null {
  return value === 'accepted' || value === 'rejected' ? value : null;
}
