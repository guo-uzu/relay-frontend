import { queryOptions } from '@tanstack/react-query'
import { api } from './api'
import type { Dashboard, Org, RowsResult, SheetSummary, Session, TableSearch } from './types'

export const PAGE_SIZE = 20
export const tz = Intl.DateTimeFormat().resolvedOptions().timeZone

export const sessionQuery = queryOptions({
  queryKey: ['session'],
  queryFn: () => api<Session>('/auth/get-session'),
})

export const orgsQuery = queryOptions({
  queryKey: ['orgs'],
  queryFn: () => api<{ id: string }[]>('/auth/organization/list'),
})

export const orgQuery = (orgId: string) =>
  queryOptions({
    queryKey: ['org', orgId],
    queryFn: () =>
      api<Org>(`/auth/organization/get-full-organization?organizationId=${orgId}`),
  })

export const dashboardQuery = (orgId: string) =>
  queryOptions({
    queryKey: ['dashboard', orgId, tz],
    queryFn: () =>
      api<Dashboard>(`/orgs/${orgId}/dashboard?tz=${encodeURIComponent(tz)}`),
    refetchInterval: 30_000,
  })

export const sheetsQuery = (orgId: string) =>
  queryOptions({
    queryKey: ['sheets', orgId],
    queryFn: () => api<SheetSummary[]>(`/google-sheets/${orgId}`),
  })

export const rowsQuery = (orgId: string, sheetId: string, s: TableSearch) => {
  const searchRecord = s as Record<string, unknown>
  const params = new URLSearchParams()

  for (const [key, value] of Object.entries(searchRecord ?? {})) {
    if (value !== undefined && value !== null && value !== '') {
      params.set(key, String(value))
    }
  }

  const queryString = params.toString() ? `?${params.toString()}` : ''

  return queryOptions({
    queryKey: ['rows', orgId, sheetId, s],
    queryFn: () =>
      api<RowsResult>(`/google-sheets/${orgId}/${sheetId}/rows${queryString}`),
  })
}

export interface HistoryEntry {
  id: string;
  action: string;
  createdAt: string;
}

export const historyQuery = (orgId: string) =>
  queryOptions({
    queryKey: ['history', orgId],
    queryFn: () => api<HistoryEntry[]>(`/google-sheets/${orgId}/history`),
  });