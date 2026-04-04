// src/app/store/institutionConfigStore.ts
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface InstitutionConfig {
  academic_period: 'term' | 'semester' | 'trimester';
  subject_naming: 'subject' | 'course' | 'module';
  student_grouping: string;
  instructor_title: string;
  class_progression_name: string;
  identifier: string;
  // Add any other fields your /preferences/ endpoint returns
  [key: string]: any;
}

interface ConfigStore {
  config: InstitutionConfig | null;
  setConfig: (config: InstitutionConfig) => void;

  // Helpers used everywhere in the app
  getLabel: (key: keyof InstitutionConfig) => string;
  getPlural: (key: keyof InstitutionConfig) => string;
}

const toSentenceCase = (str: string): string => {
  if (!str) return str;
  // Trim and handle multi-word strings
  return str
    .trim()
    .split(' ')
    .map((word, index) => {
      if (!word) return '';
      const lower = word.toLowerCase();
      // Only capitalize first word, or all words if you prefer title case
      if (index === 0) {
        return lower.charAt(0).toUpperCase() + lower.slice(1);
      }
      return lower;
    })
    .join(' ');
};

export const useInstitutionConfigStore = create<ConfigStore>()(
  persist(
    (set, get) => ({
      config: null,

      setConfig: (config) => set({ config }),

      getLabel: (key) => {
        const c = get().config;
        if (!c || !(key in c)) return String(key);
        const value = c[key];
        const label = typeof value === 'string' ? value : String(value);
        return toSentenceCase(label);
      },

      getPlural: (key) => {
        const label = get().getLabel(key);
        const lower = label.toLowerCase();

        // Simple plural rules (extend as needed)
        if (lower.endsWith('y')) return label.slice(0, -1) + 'ies';
        if (lower.endsWith('s')) return label;
        const plural = label + 's';
        return toSentenceCase(plural);
      },
    }),
    {
      name: 'institution-config',
    }
  )
);