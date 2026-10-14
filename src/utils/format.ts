import { AssetStatus, AssetType } from '../types';

export const formatCurrency = (amount: number) =>
  `₹${amount.toFixed(amount % 1 === 0 ? 0 : 2)}`;

/** 3725000 → "01:02:05"; negative values are shown as "+mm:ss" (overtime). */
export const formatDuration = (ms: number) => {
  const total = Math.floor(Math.abs(ms) / 1000);
  const h = Math.floor(total / 3600);
  const m = Math.floor((total % 3600) / 60);
  const s = total % 60;
  const pad = (n: number) => String(n).padStart(2, '0');
  const body = h > 0 ? `${pad(h)}:${pad(m)}:${pad(s)}` : `${pad(m)}:${pad(s)}`;
  return ms < 0 ? `+${body}` : body;
};

export const formatTime = (iso: string) =>
  new Date(iso).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

export const formatMinutes = (minutes: number) =>
  minutes >= 60 ? `${minutes / 60} hr` : `${minutes} min`;

export const STATUS_LABEL: Record<AssetStatus, string> = {
  available: 'Available',
  in_use: 'In Use',
  charging: 'Charging',
  maintenance: 'Maintenance',
};

export const TYPE_LABEL: Record<AssetType, string> = {
  scooter: 'E-Scooter',
  bike: 'E-Bike',
  moped: 'E-Moped',
};
