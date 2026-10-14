# Leadwisdom Rentals — React Native Assessment

A mobile app for browsing, renting and managing active rentals of electric vehicles (e-scooters, e-bikes, e-mopeds). Built with **React Native (Expo) + TypeScript**. The app talks to a **mock REST API** through **Axios** and **custom hooks**, and uses **React Navigation** (Stack + Bottom Tabs).

---

## Features

| Requirement (from brief) | Where it lives |
|---|---|
| **Authentication screen** with client-side validation for phone **or** email | `src/screens/LoginScreen.tsx`, `src/utils/validation.ts` |
| **Catalog / Home** — scrollable grid of assets with **live status tags**, **battery metrics** and **hourly rates** | `src/screens/CatalogScreen.tsx`, `src/components/AssetCard.tsx` |
| **Active Session** — live **countdown timer**, **status indicators**, **End Trip** / **Report Issue** actions | `src/screens/ActiveSessionScreen.tsx`, `src/hooks/useCountdown.ts` |
| API calls with **Axios inside custom hooks**, with loading / error / success states | `src/hooks/useApi.ts`, `useMutation.ts`, `useAssets.ts`, `useActiveRental.ts` |
| **React Navigation — Stack & Tabs** | `src/navigation/` |
| Reusable components: asset cards, state indicators, buttons, inputs | `src/components/` |
| Responsive layout across phone / tablet sizes | `src/hooks/useResponsive.ts`, `ScreenContainer.tsx` |

### Extras
- **Asset Detail** screen: pick a duration (15 min – 2 hr), see estimated cost, start a rental.
- **Report Issue** modal with category + description validation.
- **Trip Summary** after ending a trip (ride time, total fare, reported issues).
- **Session persistence** with AsyncStorage — reopening the app keeps you logged in; any `401` logs you out automatically.
- **Live data**: the catalog polls every 15 s; the mock server drains battery of in-use vehicles and charges docked ones, so status tags and battery levels change over time. Pull-to-refresh is also supported.
- **Error-state demo**: Profile → *Simulate network errors* makes every API call fail with 503, so you can see the error and Retry UI.
- Accessibility labels and roles on interactive elements; countdown is derived from the wall clock so it stays accurate after the app is backgrounded.

---

## Tech stack

- Expo SDK 57 · React Native 0.86 · React 19 · TypeScript (strict)
- React Navigation 7 (`native-stack`, `bottom-tabs`)
- Axios (custom adapter for the mock API)
- `@react-native-async-storage/async-storage`, `@expo/vector-icons`

---

## Getting started

### Prerequisites
- **Node.js 20+** and npm
- One of:
  - **Expo Go** app on a physical Android/iOS phone (easiest), or
  - **Android Studio** with an Android emulator, or
  - **Xcode** with an iOS simulator (macOS only)

### Install & run

```bash
# 1. Install dependencies
npm install

# 2. Start the Metro bundler
npx expo start
```

Then, in the Metro terminal:
- press **`a`** to open on an Android emulator,
- press **`i`** to open on an iOS simulator,
- or **scan the QR code** with Expo Go (Android) / the Camera app (iOS).

Shortcuts are also available: `npm run android`, `npm run ios`, `npm run web`.

> If Metro has stale cache issues: `npx expo start -c`

### Demo login
No backend setup is needed. Use **any valid** email (e.g. `demo@leadwisdom.com`) or 10-digit Indian mobile number (e.g. `9876543210`) with a password of **6+ characters** (e.g. `123456`).

### Quality checks
```bash
npx tsc --noEmit   # type-check
```

---

## Project structure

```
App.tsx                         # Providers + root navigator
src/
├── components/                 # Reusable UI
│   ├── AppButton.tsx           # primary / secondary / danger / ghost, loading state
│   ├── InputField.tsx          # label, icon, error text, password toggle
│   ├── AssetCard.tsx           # catalog tile
│   ├── StatusTag.tsx           # colour-coded live status pill
│   ├── BatteryIndicator.tsx    # battery gauge
│   ├── StatTile.tsx            # small metric tile
│   ├── FilterChips.tsx         # single-select chips
│   ├── ScreenState.tsx         # Loading / Error / Empty views, error banner
│   └── ScreenContainer.tsx     # responsive page wrapper
├── screens/
│   ├── LoginScreen.tsx
│   ├── CatalogScreen.tsx
│   ├── AssetDetailScreen.tsx
│   ├── ActiveSessionScreen.tsx
│   ├── ReportIssueScreen.tsx
│   ├── TripSummaryScreen.tsx
│   └── ProfileScreen.tsx
├── navigation/
│   ├── RootNavigator.tsx       # Stack: Login ⇄ (Tabs, AssetDetail, ReportIssue, TripSummary)
│   ├── MainTabs.tsx            # Bottom tabs: Fleet, Active Trip, Profile
│   └── types.ts                # typed route params
├── hooks/
│   ├── useApi.ts               # generic fetch hook: loading / refreshing / error / polling
│   ├── useMutation.ts          # write-request hook: loading / error
│   ├── useAssets.ts            # fleet list (polling) + single asset
│   ├── useActiveRental.ts      # current trip, refreshes on screen focus
│   ├── useCountdown.ts         # 1-second ticking countdown
│   └── useResponsive.ts        # breakpoints → grid columns, max widths
├── services/
│   ├── config.ts               # USE_MOCK_API flag, base URL, timeouts
│   ├── apiClient.ts            # Axios instance, auth + 401 interceptors, error normalisation
│   ├── authService.ts
│   ├── assetService.ts
│   ├── rentalService.ts
│   └── mock/
│       ├── mockServer.ts       # in-memory REST server (Axios adapter)
│       └── mockData.ts         # seed fleet
├── context/AuthContext.tsx     # user session state
├── theme/                      # colours, spacing, typography
├── types/                      # domain models
└── utils/                      # validation, formatting, confirm dialog
```

---

## Architecture notes

**Data flow:** `Screen → custom hook → service → apiClient (Axios) → mock adapter / real API`.
Screens never call Axios directly; they consume hooks that expose `{ data, loading, refreshing, error, refetch }` (reads) or `{ mutate, loading, error }` (writes). `useApi` ignores out-of-order responses and updates after unmount, and background polls keep showing the last good data instead of flashing an error screen.

**Mock API:** `src/services/mock/mockServer.ts` is a small router plugged in as an **Axios adapter**, so requests go through the same interceptors, status codes and error handling as a real backend (random 400–900 ms latency included). To use a real server, set `USE_MOCK_API = false` and `API_BASE_URL` in `src/services/config.ts`.

| Method | Endpoint | Description |
|---|---|---|
| POST | `/auth/login` | `{ identifier, password }` → `{ token, user }` |
| GET | `/assets?status=&type=` | Fleet list (filterable) |
| GET | `/assets/:id` | Single asset |
| GET | `/rentals/active` | Current rental or `null` |
| POST | `/rentals` | `{ assetId, durationMinutes }` → rental (409 if busy) |
| POST | `/rentals/:id/end` | Ends trip, returns fare |
| POST | `/rentals/:id/issues` | `{ category, description }` |

All endpoints except login require `Authorization: Bearer <token>`.

**Navigation:** auth and app screens are rendered conditionally in a single stack, so after login the Login screen is not in the back history, and logout/401 returns straight to it. Detail, Report Issue (modal) and Trip Summary are pushed above the tab navigator.

**Responsiveness:** the catalog uses 1 / 2 / 3 grid columns at < 600 / ≥ 600 / ≥ 1024 dp width; forms and detail pages are centred with a max width on tablets; layouts use flex + wrapping tiles rather than fixed widths.
---

## App walkthrough

1. **Login** — enter an email or mobile number; the field detects which one and validates it inline.
2. **Fleet** — browse assets, filter by status/type, pull to refresh. Tap an *Available* asset.
3. **Asset Details** — choose a duration and tap **Start Rental**.
4. **Active Trip** — watch the countdown, fare, battery and range update live. Try **Report Issue**, then **End Trip**.
5. **Trip Summary** — see total fare; go back to the fleet.
6. **Profile** — toggle *Simulate network errors* to inspect error states, or log out.
