import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatDate(dateString?: string, includeTime: boolean = false) {
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
    : { year: 'numeric', month: 'short', day: 'numeric' }
  return new Intl.DateTimeFormat('en-US', options).format(date)
}

export function formatRelative(d: string | Date | null | undefined): string {
  if (!d) return '—'
  const date = typeof d === 'string' ? new Date(d) : d
  const diff = date.getTime() - Date.now()
  const abs = Math.abs(diff)
  const day = 86400000
  if (abs < day) {
    const hours = Math.round(diff / 3600000)
    const rtf = new Intl.RelativeTimeFormat('en', { numeric: 'auto' })
    return rtf.format(hours, 'hour')
  }
  const days = Math.round(diff / day)
  const rtf = new Intl.RelativeTimeFormat('en', { numeric: 'auto' })
  return rtf.format(days, 'day')
}

export function daysUntil(d: string | Date | null | undefined): number | null {
  if (!d) return null
  const date = typeof d === 'string' ? new Date(d) : d
  if (Number.isNaN(date.getTime())) return null
  return Math.ceil((date.getTime() - Date.now()) / 86400000)
}

export function formatCurrency(amount: number, currency = 'XAF'): string {
  try {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency,
      maximumFractionDigits: 0,
    }).format(amount)
  } catch {
    return `${amount.toLocaleString()} ${currency}`
  }
}

export function getErrorMessage(
  error: any,
  defaultMessage: string = 'An unexpected error occurred',
): string {
  if (error?.response?.data?.detail) return error.response.data.detail
  if (error?.response?.data?.error) return error.response.data.error
  if (typeof error?.response?.data === 'string') return error.response.data
  if (error?.message) return error.message
  return defaultMessage
}

export function makeExternalReference(prefix = 'ORDER'): string {
  const d = new Date()
  const ymd = `${d.getFullYear()}${String(d.getMonth() + 1).padStart(2, '0')}${String(d.getDate()).padStart(2, '0')}`
  const rand = Math.floor(Math.random() * 9000 + 1000)
  return `${prefix}-${ymd}-${rand}`
}

/** Normalize phone: strip '+', spaces, dashes. Expect caller to combine countryCode + number. */
export function normalizePhone(countryCode: string, number: string): string {
  const cc = (countryCode || '').replace(/\D/g, '')
  const n = (number || '').replace(/\D/g, '').replace(/^0+/, '')
  return `${cc}${n}`
}
