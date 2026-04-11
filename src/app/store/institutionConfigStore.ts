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
    clearConfig: () => void;

    // Helpers used everywhere in the app
    getLabel: (key: keyof InstitutionConfig) => string;
    getPlural: (key: keyof InstitutionConfig) => string;
}

export const toSentenceCase = (str: string): string => {
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

            clearConfig: () => set({ config: null }),

            getLabel: (key) => {
                const c = get().config;
                //     if (!c || !(key in c)) return String(key);
                //     const value = c[key];
                //     const label = typeof value === 'string' ? value : String(value);
                //     return toSentenceCase(label);
                //   },
                // If no config or direct key match, handle composite replacement
                if (!c) return toSentenceCase(String(key).replace(/[_-]/g, ' '));

                // 1. Direct match: return formatted config value
                if (key in c) {
                    const value = c[key];
                    const label = typeof value === 'string' ? value : String(value);
                    return toSentenceCase(label);
                }

                // 2. Composite match: check if any config key appears as a word in the input
                let result = String(key);

                // Sort keys by length (longest first) to avoid partial replacements
                // e.g., replace "subject_naming" before "subject"
                const sortedKeys = Object.keys(c).sort((a, b) => b.length - a.length);

                for (const configKey of sortedKeys) {
                    // Create regex to match the config key as a whole word
                    // Handles underscores, hyphens, and spaces as word boundaries
                    const escapedKey = configKey.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
                    const regex = new RegExp(`\\b${escapedKey}\\b`, 'g');

                    if (regex.test(result)) {
                        const value = c[configKey];
                        const replacement = typeof value === 'string' ? value : String(value);
                        // Replace all occurrences of the config key with its formatted value
                        result = result.replace(regex, replacement);
                    }
                }

                // Format final result to sentence case
                return toSentenceCase(result.replace(/[_-]/g, ' '));
            },

            getPlural: (key) => {
                const label = get().getLabel(key);
                const lower = label.toLowerCase();

                // Simple plural rules (extend as needed)
                if (lower.endsWith('y')) return label.slice(0, -1) + 'ies';
                if (lower.endsWith('s')) return label;
                const plural = label + 's';
                return plural;
                // return toSentenceCase(plural);
            },
        }),
        {
            name: 'institution-config',
        }
    )
);