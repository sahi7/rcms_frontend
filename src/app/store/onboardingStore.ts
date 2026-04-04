import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface OnboardingData {
  school_name?: string;
  short_name?: string;
  motto?: string;
  address?: string;
  phone?: string;
  email?: string;
  website?: string;
  institution_type?: string;

  admin_email?: string;
  admin_first_name?: string;
  admin_last_name?: string;
  password?: string;
  admin_phone?: string;

  subscription?: {
    plan: string;
    features: string[];
  };
  currentStep: number;
}

interface OnboardingStore {
  data: OnboardingData;
  setData: (data: Partial<OnboardingData>) => void;
  setStep: (step: number) => void;
  reset: () => void;
}

export const useOnboardingStore = create<OnboardingStore>()(
  persist(
    (set) => ({
      data: { currentStep: 1 },
      setData: (newData) =>
        set((state) => ({ data: { ...state.data, ...newData } })),
      setStep: (step) =>
        set((state) => ({ data: { ...state.data, currentStep: step } })),
      reset: () => set({ data: { currentStep: 1 } }),
    }),
    { name: 'onboarding-storage' }
  )
);