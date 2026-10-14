import {
  AxiosError,
  AxiosHeaders,
  AxiosResponse,
  InternalAxiosRequestConfig,
} from "axios";
import { Asset, AuthResponse, Issue, IssueCategory, Rental } from "../../types";
import { createSeedAssets, estimateRange } from "./mockData";

/**
 * A tiny in-memory REST server plugged into Axios as a custom adapter.
 * Screens and hooks talk to it exactly like a real backend (HTTP verbs, URLs,
 * status codes, JSON bodies), so swapping in a real API only means setting
 * USE_MOCK_API = false in services/config.ts.
 */

// ---------------------------------------------------------------- state ---

const db = {
  assets: createSeedAssets(),
  activeRental: null as Rental | null,
  history: [] as Rental[],
  lastTick: Date.now(),
};

export const mockSettings = {
  /** When true, every request fails with a 503 — lets reviewers see error states. */
  simulateErrors: false,
  minLatencyMs: 400,
  maxLatencyMs: 900,
};

let idCounter = 1000;
const nextId = (prefix: string) => `${prefix}-${++idCounter}`;

// ----------------------------------------------------- live simulation ---

/**
 * Advances the fleet simulation based on real elapsed time so status tags and
 * battery metrics change between polls ("live" data).
 */
const tick = () => {
  const now = Date.now();
  const minutes = (now - db.lastTick) / 60_000;
  if (minutes < 0.1) return;
  db.lastTick = now;

  db.assets = db.assets.map((asset) => {
    let { batteryLevel, status } = asset;
    if (status === "in_use") batteryLevel -= minutes * 1.5;
    if (status === "charging") batteryLevel += minutes * 4;

    batteryLevel = Math.max(0, Math.min(100, batteryLevel));
    if (status === "charging" && batteryLevel >= 100) status = "available";
    if (status === "available" && batteryLevel < 10) status = "charging";

    const rounded = Math.round(batteryLevel);
    if (rounded === asset.batteryLevel && status === asset.status) return asset;
    return {
      ...asset,
      batteryLevel: rounded,
      status,
      rangeKm: estimateRange(asset.type, rounded),
      lastUpdated: new Date().toISOString(),
    };
  });
};

const updateAsset = (id: string, patch: Partial<Asset>) => {
  db.assets = db.assets.map((a) =>
    a.id === id ? { ...a, ...patch, lastUpdated: new Date().toISOString() } : a,
  );
  return db.assets.find((a) => a.id === id)!;
};

// ------------------------------------------------------------ helpers ---

class HttpError extends Error {
  constructor(
    public status: number,
    message: string,
  ) {
    super(message);
  }
}

const delay = () =>
  new Promise((r) =>
    setTimeout(
      r,
      mockSettings.minLatencyMs +
        Math.random() * (mockSettings.maxLatencyMs - mockSettings.minLatencyMs),
    ),
  );

const parseBody = (data: unknown): Record<string, any> => {
  if (!data) return {};
  if (typeof data === "string") {
    try {
      return JSON.parse(data);
    } catch {
      return {};
    }
  }
  return data as Record<string, any>;
};

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const PHONE_RE = /^[6-9]\d{9}$/;
const ISSUE_CATEGORIES: IssueCategory[] = [
  "battery",
  "brakes",
  "tyre",
  "lights",
  "other",
];

const computeCost = (rental: Rental, endedAt: number) => {
  const minutes = Math.max(
    1,
    Math.ceil((endedAt - Date.parse(rental.startTime)) / 60_000),
  );
  return Math.round((minutes / 60) * rental.hourlyRate * 100) / 100;
};

// ------------------------------------------------------------- routes ---

type Handler = (ctx: {
  params: Record<string, string>;
  query: URLSearchParams;
  body: Record<string, any>;
}) => { status?: number; data: unknown };

interface Route {
  method: string;
  pattern: RegExp;
  keys: string[];
  auth: boolean;
  handler: Handler;
}

const routes: Route[] = [];
const route = (method: string, path: string, handler: Handler, auth = true) => {
  const keys: string[] = [];
  const pattern = new RegExp(
    "^" + path.replace(/:(\w+)/g, (_, k) => (keys.push(k), "([^/]+)")) + "$",
  );
  routes.push({ method, pattern, keys, auth, handler });
};

route(
  "POST",
  "/auth/login",
  ({ body }) => {
    const identifier = String(body.identifier ?? "").trim();
    const password = String(body.password ?? "");
    if (!EMAIL_RE.test(identifier) && !PHONE_RE.test(identifier)) {
      throw new HttpError(
        422,
        "Enter a valid email or 10-digit mobile number.",
      );
    }
    if (password.length < 6) {
      throw new HttpError(401, "Invalid credentials.");
    }
    const name = identifier.includes("@")
      ? identifier.split("@")[0]
      : `Rider ${identifier.slice(-4)}`;
    const response: AuthResponse = {
      token: `mock-token-${Date.now()}`,
      user: { id: "U-1", name, identifier },
    };
    return { data: response };
  },
  false,
);

route("GET", "/assets", ({ query }) => {
  tick();
  const status = query.get("status");
  const type = query.get("type");
  let list = db.assets;
  if (status) list = list.filter((a) => a.status === status);
  if (type) list = list.filter((a) => a.type === type);
  return { data: list };
});

route("GET", "/assets/:id", ({ params }) => {
  tick();
  const asset = db.assets.find((a) => a.id === params.id);
  if (!asset) throw new HttpError(404, "Asset not found.");
  return { data: asset };
});

route("GET", "/rentals/active", () => {
  tick();
  if (db.activeRental) {
    // Keep the embedded asset snapshot fresh (battery drains during a trip).
    const asset = db.assets.find((a) => a.id === db.activeRental!.asset.id)!;
    db.activeRental = { ...db.activeRental, asset };
  }
  return { data: db.activeRental };
});

route("POST", "/rentals", ({ body }) => {
  tick();
  if (db.activeRental) {
    throw new HttpError(
      409,
      "You already have an active trip. End it before starting another.",
    );
  }
  const asset = db.assets.find((a) => a.id === body.assetId);
  if (!asset) throw new HttpError(404, "Asset not found.");
  if (asset.status !== "available") {
    throw new HttpError(
      409,
      "This asset is no longer available. Please pick another one.",
    );
  }
  const durationMinutes = Number(body.durationMinutes);
  if (![15, 30, 60, 120].includes(durationMinutes)) {
    throw new HttpError(422, "Invalid rental duration.");
  }
  const start = Date.now();
  const rented = updateAsset(asset.id, { status: "in_use" });
  db.activeRental = {
    id: nextId("RN"),
    asset: rented,
    status: "active",
    startTime: new Date(start).toISOString(),
    endTime: new Date(start + durationMinutes * 60_000).toISOString(),
    durationMinutes,
    hourlyRate: asset.hourlyRate,
    issues: [],
  };
  return { status: 201, data: db.activeRental };
});

route("POST", "/rentals/:id/end", ({ params }) => {
  tick();
  const rental = db.activeRental;
  if (!rental || rental.id !== params.id)
    throw new HttpError(404, "Active trip not found.");
  const endedAt = Date.now();
  const hasIssue = rental.issues.length > 0;
  const asset = updateAsset(rental.asset.id, {
    status: hasIssue ? "maintenance" : "available",
  });
  const completed: Rental = {
    ...rental,
    asset,
    status: "completed",
    endedAt: new Date(endedAt).toISOString(),
    totalCost: computeCost(rental, endedAt),
  };
  db.history.unshift(completed);
  db.activeRental = null;
  return { data: completed };
});

route("POST", "/rentals/:id/issues", ({ params, body }) => {
  const rental = db.activeRental;
  if (!rental || rental.id !== params.id)
    throw new HttpError(404, "Active trip not found.");
  const category = body.category as IssueCategory;
  const description = String(body.description ?? "").trim();
  if (!ISSUE_CATEGORIES.includes(category))
    throw new HttpError(422, "Select an issue category.");
  if (description.length < 10) {
    throw new HttpError(
      422,
      "Please describe the issue in at least 10 characters.",
    );
  }
  const issue: Issue = {
    id: nextId("IS"),
    category,
    description,
    createdAt: new Date().toISOString(),
  };
  db.activeRental = { ...rental, issues: [...rental.issues, issue] };
  return { status: 201, data: issue };
});

route("GET", "/rentals/history", () => ({ data: db.history }));

// ------------------------------------------------------------ adapter ---

export const mockAdapter = async (
  config: InternalAxiosRequestConfig,
): Promise<AxiosResponse> => {
  await delay();

  const method = (config.method ?? "get").toUpperCase();
  const base = config.baseURL ?? "";
  const rawUrl = (config.url ?? "").replace(base, "");
  const [path, queryString = ""] = rawUrl.split("?");
  const query = new URLSearchParams(queryString);
  Object.entries(config.params ?? {}).forEach(([k, v]) => {
    if (v !== undefined && v !== null && v !== "") query.set(k, String(v));
  });

  const respond = (status: number, data: unknown): AxiosResponse => ({
    data,
    status,
    statusText: String(status),
    headers: new AxiosHeaders({ "content-type": "application/json" }),
    config,
  });

  const fail = (status: number, message: string): never => {
    const response = respond(status, { message });
    throw new AxiosError(message, String(status), config, undefined, response);
  };

  if (mockSettings.simulateErrors) {
    fail(503, "Service temporarily unavailable (simulated).");
  }

  for (const r of routes) {
    if (r.method !== method) continue;
    const match = path.match(r.pattern);
    if (!match) continue;

    const authHeader =
      config.headers?.Authorization ?? config.headers?.authorization;
    if (r.auth && !authHeader)
      fail(401, "Session expired. Please log in again.");

    const params = Object.fromEntries(
      r.keys.map((k, i) => [k, decodeURIComponent(match[i + 1])]),
    );
    try {
      const result = r.handler({ params, query, body: parseBody(config.data) });
      return respond(result.status ?? 200, result.data);
    } catch (e) {
      if (e instanceof HttpError) fail(e.status, e.message);
      fail(500, "Unexpected server error.");
    }
  }

  return fail(404, `No mock route for ${method} ${path}`);
};
