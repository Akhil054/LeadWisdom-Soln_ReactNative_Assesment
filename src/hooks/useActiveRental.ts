import { useCallback } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import { rentalService } from '../services/rentalService';
import { useApi } from './useApi';

/**
 * Current active rental (or null). Re-fetches silently whenever the screen
 * using it gains focus, and polls while visible to keep battery data fresh.
 */
export const useActiveRental = () => {
  const api = useApi(rentalService.getActiveRental, [], { pollInterval: 20_000 });
  const { silentRefetch } = api;

  useFocusEffect(
    useCallback(() => {
      silentRefetch();
    }, [silentRefetch]),
  );

  return api;
};
