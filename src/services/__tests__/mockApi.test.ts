import { apiClient, setAuthToken, toApiError } from '../apiClient';
import { assetService } from '../assetService';
import { rentalService } from '../rentalService';
import { mockSettings } from '../mock/mockServer';

/**
 * Exercises the full stack below the UI: services → Axios client (interceptors)
 * → mock REST adapter. The mock keeps state across tests in this file, so the
 * rental tests run as one ordered flow.
 */
beforeAll(() => {
  mockSettings.minLatencyMs = 0;
  mockSettings.maxLatencyMs = 0;
});

afterEach(() => {
  mockSettings.simulateErrors = false;
});

describe('auth', () => {
  beforeEach(() => setAuthToken(null));

  it('returns 401 without a token', async () => {
    await expect(assetService.getAssets()).rejects.toEqual({
      message: 'Session expired. Please log in again.',
      status: 401,
    });
  });

  it('logs in and returns a token for a valid identifier', async () => {
    const { data } = await apiClient.post('/auth/login', { identifier: 'demo@leadwisdom.com', password: 'secret1' });
    expect(data.token).toMatch(/^mock-token-/);
    expect(data.user.name).toBe('demo');
  });

  it('rejects short passwords with 401', async () => {
    await expect(
      apiClient.post('/auth/login', { identifier: '9876543210', password: '123' }),
    ).rejects.toEqual({ message: 'Invalid credentials.', status: 401 });
  });
});

describe('fleet & rentals', () => {
  beforeAll(() => setAuthToken('test-token'));

  it('filters assets by status and type', async () => {
    const assets = await assetService.getAssets({ status: 'available', type: 'moped' });
    expect(assets.length).toBeGreaterThan(0);
    expect(assets.every((a) => a.status === 'available' && a.type === 'moped')).toBe(true);
  });

  it('runs a full trip: start → conflict → report issue → end', async () => {
    const rental = await rentalService.startRental('SC-101', 30);
    expect(rental.status).toBe('active');
    expect(rental.asset.status).toBe('in_use');

    // Only one active trip at a time.
    await expect(rentalService.startRental('SC-102', 30)).rejects.toMatchObject({ status: 409 });

    await rentalService.reportIssue(rental.id, { category: 'brakes', description: 'Rear brake feels loose' });

    const completed = await rentalService.endRental(rental.id);
    expect(completed.status).toBe('completed');
    expect(completed.totalCost).toBeGreaterThan(0);
    // An issue was reported, so the vehicle goes to maintenance instead of back to the fleet.
    expect(completed.asset.status).toBe('maintenance');
    expect(await rentalService.getActiveRental()).toBeNull();
  });

  it('refuses to rent an asset that is not available', async () => {
    await expect(rentalService.startRental('EB-202', 30)).rejects.toEqual({
      message: 'This asset is no longer available. Please pick another one.',
      status: 409,
    });
  });

  it('surfaces simulated server errors as a normalised ApiError', async () => {
    mockSettings.simulateErrors = true;
    await expect(assetService.getAssets()).rejects.toEqual({
      message: 'Service temporarily unavailable (simulated).',
      status: 503,
    });
  });
});

describe('toApiError', () => {
  it('falls back to a generic message for unknown values', () => {
    expect(toApiError(undefined)).toEqual({ message: 'Something went wrong. Please try again.' });
  });
});
