/**
 * API configuration.
 *
 * USE_MOCK_API = true  → requests are served by the in-app mock REST server
 *                        (src/services/mock/mockServer.ts) through a custom
 *                        Axios adapter, so the app works with zero backend setup.
 * USE_MOCK_API = false → requests go to API_BASE_URL over the network. The
 *                        endpoint contract is documented in README.md.
 */
export const USE_MOCK_API = true;

export const API_BASE_URL = 'https://api.leadwisdom-rentals.example/v1';

export const REQUEST_TIMEOUT_MS = 10_000;

/** How often the catalog silently refreshes live asset status (ms). */
export const CATALOG_POLL_INTERVAL_MS = 15_000;
