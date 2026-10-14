import { Issue, IssueCategory, Rental } from '../types';
import { apiClient } from './apiClient';

export const rentalService = {
  async getActiveRental(): Promise<Rental | null> {
    const { data } = await apiClient.get<Rental | null>('/rentals/active');
    return data;
  },

  async startRental(assetId: string, durationMinutes: number): Promise<Rental> {
    const { data } = await apiClient.post<Rental>('/rentals', { assetId, durationMinutes });
    return data;
  },

  async endRental(rentalId: string): Promise<Rental> {
    const { data } = await apiClient.post<Rental>(`/rentals/${rentalId}/end`);
    return data;
  },

  async reportIssue(
    rentalId: string,
    payload: { category: IssueCategory; description: string },
  ): Promise<Issue> {
    const { data } = await apiClient.post<Issue>(`/rentals/${rentalId}/issues`, payload);
    return data;
  },
};
