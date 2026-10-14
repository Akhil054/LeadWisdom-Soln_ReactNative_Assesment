import { formatCurrency, formatDuration, formatMinutes } from '../format';

describe('formatDuration', () => {
  it('formats under an hour as mm:ss', () => {
    expect(formatDuration(65_000)).toBe('01:05');
  });

  it('formats an hour or more as hh:mm:ss', () => {
    expect(formatDuration(3_725_000)).toBe('01:02:05');
  });

  it('prefixes overtime (negative) values with +', () => {
    expect(formatDuration(-90_000)).toBe('+01:30');
  });
});

describe('formatCurrency', () => {
  it('drops decimals for whole rupees and keeps two otherwise', () => {
    expect(formatCurrency(60)).toBe('₹60');
    expect(formatCurrency(12.5)).toBe('₹12.50');
  });
});

describe('formatMinutes', () => {
  it('switches to hours from 60 minutes', () => {
    expect(formatMinutes(30)).toBe('30 min');
    expect(formatMinutes(120)).toBe('2 hr');
  });
});
