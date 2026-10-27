export type Action = 'added' | 'edited' | 'deleted' | 'imported' | 'connected'
export const ACTIONS: Action[] = ['added', 'edited', 'deleted', 'imported', 'connected']

export type SheetSummary = { id: string; name: string; rowCount: number; importedAt: string | null }

export type HistoryEvent = {
  id: string
  action: Action
  source: 'sheet' | 'platform'
  actor: string
  at: string
  sheetName: string
  row?: number
  column?: string
  old?: string
  new?: string
  n?: number
}

export type Dashboard = {
  series: ({ date: string } & Record<Action, number>)[]
  events: HistoryEvent[]
  actors: { email: string; count: number }[]
  sheets: SheetSummary[]
  seats: { used: number; max: number }
}

export const OPS = ['contains', 'equals', 'startsWith', 'gt', 'lt', 'isEmpty'] as const
export type Op = (typeof OPS)[number]
export type Rule = { column: string; op: Op; value: string }

export type TableSearch = {
  terms: string[]
  mode: 'and' | 'or'
  filters: Rule[]
  fmode: 'and' | 'or'
  sort?: string
  dir: 'asc' | 'desc'
  page: number
}

export type RowsResult = { headers: string[]; rows: { n: number; cells: string[] }[]; total: number; sheetName: string }

export type Role = 'owner' | 'admin' | 'member'
export type Org = {
  id: string
  name: string
  members: { id: string; userId: string; role: Role; user: { name: string; email: string } }[]
  invitations: { id: string; email: string; role: Role; status: string; expiresAt: string }[]
}
export type Session = { user: { id: string; name: string; email: string } } | null

export const EMPTY_SEARCH: TableSearch = { terms: [], mode: 'and', filters: [], fmode: 'and', dir: 'asc', page: 1 }
