import { Asset, AssetStatus, AssetType } from '../types';
import { apiClient } from './apiClient';

export interface AssetFilters {
  status?: AssetStatus;
  type?: AssetType;
}

export const assetService = {
  async getAssets(filters: AssetFilters = {}): Promise<Asset[]> {
    const { data } = await apiClient.get<Asset[]>('/assets', { params: filters });
    return data;
  },

  async getAsset(id: string): Promise<Asset> {
    const { data } = await apiClient.get<Asset>(`/assets/${encodeURIComponent(id)}`);
    return data;
  },
};
