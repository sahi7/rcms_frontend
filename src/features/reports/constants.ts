// src/features/reports/constants.ts
export const REPORTS_API = {
  READINESS: "/api/reports/readiness/",
  GENERATE: "/api/reports/generate/",
  STATUS: (id: string) => `/api/reports/status/${id}/`,
};

export const POLLING_INTERVAL = 3000; // 3 seconds