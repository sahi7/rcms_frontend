
// src/lib/utils.ts
import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatDate(
  dateString?: string,
  includeTime: boolean = false
) {
  if (!dateString) return '-'

  const date = new Date(dateString)

  const options: Intl.DateTimeFormatOptions = includeTime
    ? {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      }
    : {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      }

  return new Intl.DateTimeFormat('en-US', options).format(date)
}

// Handles the { detail: "..." } format
export function getErrorMessage(error: any, defaultMessage: string = 'An unexpected error occurred'): string {
  if (error?.response?.data?.detail) {
    return error.response.data.detail;
  }
  if (typeof error?.response?.data === 'string') {
    return error.response.data;
  }
  if (error?.message) {
    return error.message;
  }
  return defaultMessage;
}