import { useRef, useState } from 'react'
import { createFileRoute } from '@tanstack/react-router'
import { useMutation, useQueryClient, useSuspenseQuery } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'
import { api } from '../../../api'
import { Highlight } from '../../../components/bits'
import { Icon } from '../../../components/Icon'
import { fold, num, toastError } from '../../../lib'
import { PAGE_SIZE, rowsQuery } from '../../../queries'
import { OPS, type Op, type Rule, type TableSearch } from '../../../types'

const isRule = (r: unknown): r is Rule => {
  const x = r as Rule
  return typeof x?.column === 'string' && typeof x.value === 'string' && (OPS as readonly string[]).includes(x.op)
}

export const Route = createFileRoute('/_app/sheets/$sheetId')({
  // The URL is user-editable, so it is validated here before it reaches the API.
  validateSearch: (s: Record<string, unknown>): TableSearch => ({
    terms: Array.isArray(s.terms) ? s.terms.map(String) : [],
    mode: s.mode === 'or' ? 'or' : 'and',
    filters: Array.isArray(s.filters) ? s.filters.filter(isRule) : [],
    fmode: s.fmode === 'or' ? 'or' : 'and',
    sort: typeof s.sort === 'string' ? s.sort : undefined,
    dir: s.dir === 'desc' ? 'desc' : 'asc',
    page: Math.max(1, Math.floor(Number(s.page)) || 1),
  }),
  loaderDeps: ({ search }) => search,
  loader: ({ context, params, deps }) => context.queryClient.ensureQueryData(rowsQuery(context.orgId, params.sheetId, deps)),
  component: DataTable,
})

function Seg<T extends string>({ value, items, onChange }: { value: T; items: [T, string][]; onChange: (v: T) => void }) {
  return (
    <div className="rl-seg" role="group">
      {items.map(([v, label]) => <button key={v} type="button" aria-pressed={value === v} onClick={() => onChange(v)}>{label}</button>)}
    </div>
  )
}

function DataTable() {
  const { t } = useTranslation()
  const { orgId } = Route.useRouteContext()
  const { sheetId } = Route.useParams()
  const search = Route.useSearch()
  const navigate = Route.useNavigate()
  const { data } = useSuspenseQuery(rowsQuery(orgId, sheetId, search))
  const [showFilters, setShowFilters] = useState(search.filters.length > 0)
  const set = (patch: Partial<TableSearch>) => void navigate({ search: (p) => ({ ...p, page: 1, ...patch }) })

  const { headers, rows, total, sheetName } = data
  const pages = Math.max(1, Math.ceil(total / PAGE_SIZE))
  const addTerm = (v: string) => {
    v = v.trim().replace(/,$/, '')
    if (v && !search.terms.some((x) => fold(x) === fold(v))) set({ terms: [...search.terms, v] })
  }

  return (
    <>
      <header className="page-h">
        <div><h1>{sheetName}</h1><p>{t('sheets.rowsN', { n: num(total) })}</p></div>
      </header>

      <div className="rl-toolbar">
        <div className="rl-search">
          <div className="rl-chips">
            {search.terms.map((x, i) => (
              <span className="rl-chip" key={x}>{x}
                <button type="button" aria-label={t('table.removeTerm', { term: x })} onClick={() => set({ terms: search.terms.filter((_, j) => j !== i) })}><Icon name="x" size={12} /></button>
              </span>
            ))}
          </div>
          <input
            className="rl-input" type="text" autoComplete="off" spellCheck={false} aria-label={t('table.searchLabel')} placeholder={t('table.search')}
            onKeyDown={(e) => {
              const input = e.currentTarget
              if (e.key === 'Enter' || e.key === ',') {
                e.preventDefault()
                addTerm(input.value)
                input.value = ''
              } else if (e.key === 'Backspace' && !input.value && search.terms.length) set({ terms: search.terms.slice(0, -1) })
            }}
          />
        </div>
        <Seg value={search.mode} onChange={(mode) => set({ mode })} items={[['and', t('table.all')], ['or', t('table.any')]]} />
        <button type="button" className="rl-btn" aria-expanded={showFilters} onClick={() => setShowFilters(!showFilters)}>
          <Icon name="filter" size={16} /><span>{t('table.filters')}</span><b className="rl-count">{search.filters.length || ''}</b>
        </button>
        <AddRow headers={headers} sheetName={sheetName} orgId={orgId} sheetId={sheetId} />
      </div>

      {showFilters && <Filters headers={headers} search={search} set={set} />}

      <div className="rl-tablewrap">
        {total === 0 ? (
          <div className="rl-empty">
            <p>{t('table.empty')}</p>
            <button type="button" className="rl-btn" onClick={() => set({ terms: [], filters: [] })}>{t('table.clear')}</button>
          </div>
        ) : (
          <table className="rl-table">
            <thead>
              <tr>
                <th scope="col" className="rl-rn">#</th>
                {headers.map((h) => {
                  const on = search.sort === h
                  return (
                    <th scope="col" key={h} aria-sort={on ? (search.dir === 'asc' ? 'ascending' : 'descending') : undefined}>
                      <button type="button" className="rl-th" onClick={() => set(!on ? { sort: h, dir: 'asc' } : search.dir === 'asc' ? { sort: h, dir: 'desc' } : { sort: undefined, dir: 'asc' })}>
                        {h}<span className="rl-sort" aria-hidden="true">{on ? (search.dir === 'asc' ? '▲' : '▼') : ''}</span>
                      </button>
                    </th>
                  )
                })}
              </tr>
            </thead>
            <tbody>
              {rows.map(({ n, cells }) => (
                <tr key={n}>
                  <td className="rl-rn">{n}</td>
                  {cells.map((c, i) => <td key={i}><Highlight text={c} terms={search.terms} /></td>)}
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <div className="rl-pager">
        <span aria-live="polite">{total ? t('table.range', { from: (search.page - 1) * PAGE_SIZE + 1, to: Math.min(search.page * PAGE_SIZE, total), n: total }) : '0'}</span>
        <span className="rl-pager-btns">
          <button type="button" className="rl-btn" disabled={search.page <= 1} onClick={() => set({ page: search.page - 1 })}>{t('table.prev')}</button>
          <button type="button" className="rl-btn" disabled={search.page >= pages} onClick={() => set({ page: search.page + 1 })}>{t('table.next')}</button>
        </span>
      </div>
    </>
  )
}

function Filters({ headers, search, set }: { headers: string[]; search: TableSearch; set: (p: Partial<TableSearch>) => void }) {
  const { t } = useTranslation()
  const [op, setOp] = useState<Op>('contains')
  return (
    <form
      className="rl-filters"
      onSubmit={(e) => {
        e.preventDefault()
        const f = new FormData(e.currentTarget)
        const value = String(f.get('value') ?? '').trim()
        if (!value && op !== 'isEmpty') return
        set({ filters: [...search.filters, { column: String(f.get('column')), op, value }] })
        e.currentTarget.reset()
        setOp('contains')
      }}
    >
      <label>{t('table.column')}<select className="rl-select" name="column">{headers.map((h) => <option key={h}>{h}</option>)}</select></label>
      <label>
        {t('table.operator')}
        <select className="rl-select" value={op} onChange={(e) => setOp(e.target.value as Op)}>{OPS.map((o) => <option key={o} value={o}>{t(`op.${o}`)}</option>)}</select>
      </label>
      <label>{t('table.value')}<input className="rl-field-input" name="value" autoComplete="off" disabled={op === 'isEmpty'} /></label>
      <button className="rl-btn" type="submit">{t('table.addFilter')}</button>
      <Seg value={search.fmode} onChange={(fmode) => set({ fmode })} items={[['and', t('table.rulesAll')], ['or', t('table.rulesAny')]]} />
      <div className="rl-chips">
        {search.filters.map((f, i) => (
          <span className="rl-chip rl-chip-rule" key={i}><b>{f.column}</b> {t(`op.${f.op}`)} {f.value}
            <button type="button" aria-label={t('table.removeRule')} onClick={() => set({ filters: search.filters.filter((_, j) => j !== i) })}><Icon name="x" size={12} /></button>
          </span>
        ))}
      </div>
    </form>
  )
}

function AddRow({ headers, sheetName, orgId, sheetId }: { headers: string[]; sheetName: string; orgId: string; sheetId: string }) {
  const { t } = useTranslation()
  const qc = useQueryClient()
  const dlg = useRef<HTMLDialogElement>(null)
  const [empty, setEmpty] = useState(false)
  const append = useMutation({
    mutationFn: (cells: string[]) => api(`/google-sheets/${orgId}/sheets/${sheetId}/rows/append`, { cells }),
    onSuccess: () => {
      dlg.current?.close()
      toast.success(t('addrow.done', { sheet: sheetName }))
      return qc.invalidateQueries() // the new row changes row data, sheet list and dashboard
    },
    onError: toastError,
  })

  return (
    <>
      <button type="button" className="rl-btn rl-btn-primary" onClick={() => { setEmpty(false); dlg.current?.showModal() }}>
        <Icon name="plus" size={16} /><span>{t('table.addRow')}</span>
      </button>
      <dialog className="rl-dialog" ref={dlg} aria-labelledby="addrow-title" onClick={(e) => e.target === dlg.current && dlg.current.close()}>
        <form
          onSubmit={(e) => {
            e.preventDefault()
            const form = e.currentTarget
            const f = new FormData(form)
            const cells = headers.map((_, i) => String(f.get(`c${i}`) ?? '').trim())
            if (!cells.some(Boolean)) return setEmpty(true)
            append.mutate(cells, { onSuccess: () => form.reset() })
          }}
        >
          <header><h2 id="addrow-title">{t('addrow.title', { sheet: sheetName })}</h2><p>{t('addrow.hint')}</p></header>
          <div className="rl-fields">
            {headers.map((h, i) => <label key={h + i}>{h}<input className="rl-field-input" name={`c${i}`} autoComplete="off" /></label>)}
          </div>
          {empty && <p className="rl-error" role="alert">{t('addrow.error')}</p>}
          <footer>
            <button type="button" className="rl-btn" onClick={() => dlg.current?.close()}>{t('addrow.cancel')}</button>
            <button className="rl-btn rl-btn-primary" type="submit" disabled={append.isPending}>{t('addrow.submit')}</button>
          </footer>
        </form>
      </dialog>
    </>
  )
}
