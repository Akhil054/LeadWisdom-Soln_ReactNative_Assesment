export type AssetType = 'scooter' | 'bike' | 'moped';

export type AssetStatus = 'available' | 'in_use' | 'charging' | 'maintenance';

export interface Asset {
  id: string;
  name: string;
  type: AssetType;
  status: AssetStatus;
  batteryLevel: number; // 0 - 100
  rangeKm: number; // estimated range at current battery
  hourlyRate: number; // INR per hour
  location: string;
  lastUpdated: string; // ISO timestamp
}

export interface User {
  id: string;
  name: string;
  identifier: string; // phone or email used to log in
}

export interface AuthResponse {
  token: string;
  user: User;
}

export type RentalStatus = 'active' | 'completed';

export interface Rental {
  id: string;
  asset: Asset;
  status: RentalStatus;
  startTime: string; // ISO
  endTime: string; // ISO — planned end of the booked slot
  durationMinutes: number;
  hourlyRate: number;
  endedAt?: string;
  totalCost?: number;
  issues: Issue[];
}

export type IssueCategory = 'battery' | 'brakes' | 'tyre' | 'lights' | 'other';

export interface Issue {
  id: string;
  category: IssueCategory;
  description: string;
  createdAt: string;
}

export interface ApiError {
  message: string;
  status?: number;
}
