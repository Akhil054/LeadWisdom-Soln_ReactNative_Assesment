import { Asset } from '../../types';

const now = () => new Date().toISOString();

/** Seed fleet served by the mock API. */
export const createSeedAssets = (): Asset[] =>
  ([
  { id: 'SC-101', name: 'Volt Scooter 101', type: 'scooter', status: 'available', batteryLevel: 92, rangeKm: 0, hourlyRate: 60, location: 'FC Road Hub', lastUpdated: now() },
  { id: 'SC-102', name: 'Volt Scooter 102', type: 'scooter', status: 'available', batteryLevel: 67, rangeKm: 0, hourlyRate: 60, location: 'FC Road Hub', lastUpdated: now() },
  { id: 'SC-103', name: 'Volt Scooter 103', type: 'scooter', status: 'charging', batteryLevel: 34, rangeKm: 0, hourlyRate: 60, location: 'Shivajinagar Dock', lastUpdated: now() },
  { id: 'SC-104', name: 'Volt Scooter 104', type: 'scooter', status: 'in_use', batteryLevel: 58, rangeKm: 0, hourlyRate: 60, location: 'Koregaon Park', lastUpdated: now() },
  { id: 'EB-201', name: 'Trail E-Bike 201', type: 'bike', status: 'available', batteryLevel: 81, rangeKm: 0, hourlyRate: 45, location: 'Baner Station', lastUpdated: now() },
  { id: 'EB-202', name: 'Trail E-Bike 202', type: 'bike', status: 'maintenance', batteryLevel: 12, rangeKm: 0, hourlyRate: 45, location: 'Service Centre', lastUpdated: now() },
  { id: 'EB-203', name: 'Trail E-Bike 203', type: 'bike', status: 'available', batteryLevel: 100, rangeKm: 0, hourlyRate: 45, location: 'Aundh Hub', lastUpdated: now() },
  { id: 'EB-204', name: 'Trail E-Bike 204', type: 'bike', status: 'available', batteryLevel: 19, rangeKm: 0, hourlyRate: 45, location: 'Kothrud Depot', lastUpdated: now() },
  { id: 'MP-301', name: 'City Moped 301', type: 'moped', status: 'available', batteryLevel: 74, rangeKm: 0, hourlyRate: 120, location: 'Viman Nagar Hub', lastUpdated: now() },
  { id: 'MP-302', name: 'City Moped 302', type: 'moped', status: 'in_use', batteryLevel: 45, rangeKm: 0, hourlyRate: 120, location: 'Hinjewadi Ph-1', lastUpdated: now() },
  { id: 'MP-303', name: 'City Moped 303', type: 'moped', status: 'charging', batteryLevel: 88, rangeKm: 0, hourlyRate: 120, location: 'Hadapsar Dock', lastUpdated: now() },
  { id: 'MP-304', name: 'City Moped 304', type: 'moped', status: 'available', batteryLevel: 96, rangeKm: 0, hourlyRate: 120, location: 'Camp Hub', lastUpdated: now() },
] as Asset[]).map((a) => ({ ...a, rangeKm: estimateRange(a.type, a.batteryLevel) }));

const FULL_RANGE_KM: Record<Asset['type'], number> = {
  scooter: 40,
  bike: 60,
  moped: 80,
};

export const estimateRange = (type: Asset['type'], battery: number) =>
  Math.round((FULL_RANGE_KM[type] * battery) / 100);
