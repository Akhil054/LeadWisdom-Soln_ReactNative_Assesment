const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const PHONE_RE = /^[6-9]\d{9}$/; // Indian 10-digit mobile number

export type IdentifierKind = 'email' | 'phone' | 'unknown';

/** Decide whether the user is typing a phone number or an email. */
export const detectIdentifierKind = (value: string): IdentifierKind => {
  const v = value.trim();
  if (!v) return 'unknown';
  if (/^[+\d\s-]+$/.test(v)) return 'phone';
  return 'email';
};

/** Strips spaces, dashes and an optional +91 / 0 prefix. */
export const normalizePhone = (value: string) =>
  value.replace(/[\s-]/g, '').replace(/^(\+91|0)/, '');

export const validateIdentifier = (value: string): string | null => {
  const v = value.trim();
  if (!v) return 'Email or mobile number is required.';
  if (detectIdentifierKind(v) === 'phone') {
    return PHONE_RE.test(normalizePhone(v)) ? null : 'Enter a valid 10-digit mobile number.';
  }
  return EMAIL_RE.test(v) ? null : 'Enter a valid email address.';
};

export const validatePassword = (value: string): string | null => {
  if (!value) return 'Password is required.';
  if (value.length < 6) return 'Password must be at least 6 characters.';
  return null;
};
