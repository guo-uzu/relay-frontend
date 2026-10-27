import i18n from 'i18next'
import { toast } from 'sonner'
import { ApiError } from './api'

export const rel = (iso: string) => {
  const rtf = new Intl.RelativeTimeFormat(i18n.language, { numeric: 'auto' })
  const s = (new Date(iso).getTime() - Date.now()) / 1000
  const a = Math.abs(s)
  if (a < 45) return rtf.format(0, 'second')
  if (a < 3600) return rtf.format(Math.round(s / 60), 'minute')
  if (a < 86400) return rtf.format(Math.round(s / 3600), 'hour')
  return rtf.format(Math.round(s / 86400), 'day')
}

export const num = (n: number) => new Intl.NumberFormat(i18n.language).format(n)

// Backend errors are mapped by code; unknown codes fall back to the generic message.
export function errorText(e: unknown) {
  const code = e instanceof ApiError ? e.code : undefined
  const key = `error.${code}`
  return i18n.exists(key) ? i18n.t(key as 'error.generic') : i18n.t('error.generic')
}

export const toastError = (e: unknown) => toast.error(errorText(e))

// Accent- and case-insensitive; the backend must fold the same way or matches are found but not highlighted.
export const fold = (s: string) => [...s].map((c) => [...c.normalize('NFD')][0]!).join('').toLowerCase()

export const day = (ymd: string) => new Intl.DateTimeFormat(i18n.language, { weekday: 'short', day: 'numeric', month: 'short' }).format(new Date(`${ymd}T12:00:00`))
