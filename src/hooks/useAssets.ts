import { useCallback } from 'react';
import { assetService, AssetFilters } from '../services/assetService';
import { CATALOG_POLL_INTERVAL_MS } from '../services/config';
import { useApi } from './useApi';

/** Fleet catalog with live polling for status / battery updates. */
export const useAssets = (filters: AssetFilters = {}) => {
  const { status, type } = filters;
  const fetcher = useCallback(() => assetService.getAssets({ status, type }), [status, type]);
  return useApi(fetcher, [fetcher], { pollInterval: CATALOG_POLL_INTERVAL_MS });
};

/** Single asset details. */
export const useAsset = (id: string) => {
  const fetcher = useCallback(() => assetService.getAsset(id), [id]);
  return useApi(fetcher, [fetcher]);
};
