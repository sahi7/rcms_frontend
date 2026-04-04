// src/features/landing/hooks/usePlansAndFeatures.ts
import { useQuery } from '@tanstack/react-query';
import api from '@/lib/api';

export interface Feature {
  code: string;
  name: string;
  description: string;
  type: 1 | 2;              // 1 = core, 2 = addon
  additional_price: string;
}

export interface Plan {
  code: string;
  default_price: string;
  is_active: boolean;
  features: string[];     // array of feature codes
}

export function usePlansAndFeatures() {
  const plansQuery = useQuery<Plan[]>({
    queryKey: ['plans'],
    queryFn: async () => {
      const res = await api.get<Plan[]>('/plans/');
      return res.data.filter((p) => p.is_active);
    },
    staleTime: 1000 * 60 * 10, // 10 minutes cache
  });

  const featuresQuery = useQuery<Feature[]>({
    queryKey: ['features'],
    queryFn: async () => {
      const res = await api.get<Feature[]>('/features/');
      return res.data;
    },
    staleTime: 1000 * 60 * 10,
  });

  const getFeatureByCode = (code: string) =>
    featuresQuery.data?.find((f) => f.code === code);

  const getPlanName = (code: string) =>
    code.charAt(0).toUpperCase() + code.slice(1);

  return {
    plans: plansQuery.data ?? [],
    features: featuresQuery.data ?? [],
    isLoading: plansQuery.isLoading || featuresQuery.isLoading,
    error: plansQuery.error || featuresQuery.error,
    getFeatureByCode,
    getPlanName,
  };
}