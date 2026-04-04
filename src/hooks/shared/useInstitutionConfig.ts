// src/hooks/shared/useInstitutionConfig.ts
import { useQuery } from '@tanstack/react-query';
import api from '@/lib/api';
import { useInstitutionConfigStore } from '@/app/store/institutionConfigStore';

export function useInstitutionConfig() {
  const { config, setConfig } = useInstitutionConfigStore();

  const query = useQuery({
    queryKey: ['institution-config'],
    queryFn: async () => {
      const res = await api.get('/preferences/');   // ← your exact endpoint
      const data = res.data as any;
      setConfig(data);
      return data;
    },
    enabled: !config,                    // only fetch if not already in store
    staleTime: Infinity,                 // never refetch automatically
    // cacheTime: Infinity,
  });

  return {
    config: config || query.data,
    isLoading: query.isLoading,
    error: query.error,

    // These helpers are used throughout the app
    getLabel: useInstitutionConfigStore.getState().getLabel,
    getPlural: useInstitutionConfigStore.getState().getPlural,
  };
}