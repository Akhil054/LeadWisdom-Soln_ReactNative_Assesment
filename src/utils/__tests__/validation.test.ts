import { detectIdentifierKind, normalizePhone, validateIdentifier, validatePassword } from '../validation';

describe('detectIdentifierKind', () => {
  it.each([
    ['', 'unknown'],
    ['   ', 'unknown'],
    ['9876543210', 'phone'],
    ['+91 98765-43210', 'phone'],
    ['demo@leadwisdom.com', 'email'],
    ['demo', 'email'],
  ])('%p → %p', (input, expected) => {
    expect(detectIdentifierKind(input)).toBe(expected);
  });
});

describe('normalizePhone', () => {
  it('strips spaces, dashes and +91 / 0 prefixes', () => {
    expect(normalizePhone('+91 98765-43210')).toBe('9876543210');
    expect(normalizePhone('09876543210')).toBe('9876543210');
  });
});

describe('validateIdentifier', () => {
  it('requires a value', () => {
    expect(validateIdentifier('  ')).toBe('Email or mobile number is required.');
  });

  it('accepts valid Indian mobile numbers, including formatted ones', () => {
    expect(validateIdentifier('9876543210')).toBeNull();
    expect(validateIdentifier('+91 98765 43210')).toBeNull();
  });

  it('rejects mobile numbers that are too short or start with 0–5', () => {
    expect(validateIdentifier('98765')).toBe('Enter a valid 10-digit mobile number.');
    expect(validateIdentifier('5876543210')).toBe('Enter a valid 10-digit mobile number.');
  });

  it('validates email format', () => {
    expect(validateIdentifier('demo@leadwisdom.com')).toBeNull();
    expect(validateIdentifier('demo@leadwisdom')).toBe('Enter a valid email address.');
  });
});

describe('validatePassword', () => {
  it('requires at least 6 characters', () => {
    expect(validatePassword('')).toBe('Password is required.');
    expect(validatePassword('12345')).toBe('Password must be at least 6 characters.');
    expect(validatePassword('123456')).toBeNull();
  });
});
