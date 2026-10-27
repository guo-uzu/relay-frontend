import { createFileRoute } from '@tanstack/react-router'
import { useSuspenseQuery } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import { Icon } from '../../components/Icon'
import { Avatar, nameOf } from '../../components/bits'
import { day, rel, num } from '../../lib'
import { useImportSheet } from '../../mutations'
import { dashboardQuery, tz } from '../../queries'
import { ACTIONS, type HistoryEvent } from '../../types'

export const Route = createFileRoute('/_app/dashboard')({
  loader: ({ context }) => context.queryClient.ensureQueryData(dashboardQuery(context.orgId)),
  component: Dashboard,
})

const color = (a: string) => `var(--a-${a})`
const rise = (i: number, cls = '') => ({ className: `${cls} rise`.trim(), style: { '--i': i } as React.CSSProperties })
const total = (d: Record<string, number | string>) => ACTIONS.reduce((s, a) => s + (d[a] as number), 0)

function Dashboard() {
  const { t } = useTranslation()
  const { orgId, isAdmin } = Route.useRouteContext()
  const { data } = useSuspenseQuery(dashboardQuery(orgId))
  const importSheet = useImportSheet(orgId)

  const today = data.series[data.series.length - 1]
  const max = Math.max(1, ...data.series.map(total))
  const week = data.series.slice(-7).reduce((s, d) => s + total(d), 0)
  const rows = data.sheets.reduce((s, x) => s + x.rowCount, 0)

  return (
    <>
      <header {...rise(0, 'page-h')}>
        <div>
          <h1>{t('dash.summary', { n: today ? total(today) : 0 })}</h1>
          <p>{t('dash.tz', { tz })}</p>
        </div>
        <div className="live"><span><i className="dot" />{t('dash.checking')}</span><div className="poll" aria-hidden="true"><i /></div></div>
      </header>

      {today && (
        <section {...rise(1)} aria-label={t('dash.today')}>
          <div className="split" aria-hidden="true">
            {ACTIONS.filter((a) => today[a]).map((a) => <i key={a} style={{ '--n': today[a], '--c': color(a) } as React.CSSProperties} />)}
          </div>
          <div className="split-legend">
            {ACTIONS.filter((a) => today[a]).map((a) => <span key={a} style={{ '--c': color(a) } as React.CSSProperties}><b>{today[a]}</b>{t(`act.${a}`)}</span>)}
          </div>
          <dl className="stats">
            <div><dd>{data.sheets.length}</dd><dt>{t('dash.sheets')}</dt></div>
            <div><dd>{num(rows)}</dd><dt>{t('dash.rows')}</dt></div>
            <div><dd>{num(week)}</dd><dt>{t('dash.week')}</dt></div>
            <div><dd>{t('dash.seatsOf', data.seats)}</dd><dt>{t('dash.members')}</dt></div>
          </dl>
        </section>
      )}

      <div className="cols">
        <section {...rise(2, 'panel feed')}>
          <h2>{t('dash.recent')}</h2>
          <p className="hint">{t('dash.recentHint')}</p>
          <ul className="tl">{data.events.map((ev) => <EventItem key={ev.id} ev={ev} />)}</ul>
        </section>
        <div>
          <section {...rise(3, 'panel')}>
            <h2>{t('dash.activity')}</h2>
            <div className="bars" role="img" aria-label={t('dash.activity')} style={{ marginTop: 14 }}>
              {data.series.map((d) => (
                <div className="bar" key={d.date} title={`${d.date}: ${total(d)}`}>
                  {ACTIONS.map((a) => <i key={a} style={{ '--c': color(a), height: `${(d[a] / max) * 100}%` } as React.CSSProperties} />)}
                </div>
              ))}
            </div>
            <div className="axis"><span>{day(data.series[0]!.date)}</span><span>{t('dash.today')}</span></div>
          </section>
          <section {...rise(4, 'panel')}>
            <h2>{t('dash.actors')}</h2>
            {data.actors.map((a) => (
              <div className="who" key={a.email}><Avatar who={a.email} /><div className="nm"><b>{nameOf(a.email)}</b></div><span className="count">{a.count}</span></div>
            ))}
          </section>
          <section {...rise(5, 'panel')}>
            <h2>{t('dash.freshness')}</h2>
            {data.sheets.map((s) => {
              const age = s.importedAt ? (Date.now() - new Date(s.importedAt).getTime()) / 864e5 : null
              const [label, c] = age === null ? [t('dash.never'), 'var(--ink-faint)'] : age > 7 ? [t('dash.stale'), 'var(--warn)'] : [t('dash.fresh'), 'var(--ok)']
              return (
                <div className="sheetrow" key={s.id}>
                  <i className="sd" style={{ '--c': c } as React.CSSProperties} />
                  <div className="nm"><b>{s.name}</b><small>{label}{s.importedAt && `, ${rel(s.importedAt)}`}</small></div>
                  {isAdmin && (
                    <button className="icobtn" disabled={importSheet.isPending} onClick={() => importSheet.mutate(s.id)} aria-label={`${age === null ? t('dash.import') : t('dash.reimport')}: ${s.name}`}>
                      <Icon name="refresh" size={17} />
                    </button>
                  )}
                </div>
              )
            })}
          </section>
        </div>
      </div>
    </>
  )
}

function EventItem({ ev }: { ev: HistoryEvent }) {
  const { t } = useTranslation()
  const c = { '--c': color(ev.action) } as React.CSSProperties
  return (
    <li className="tl-item">
      <div>
        <span className="node" style={c} title={t(`act.${ev.action}`)} />
        <div>
          <div className="line1"><b>{nameOf(ev.actor)}</b> {t(`ev.${ev.action}`, { column: ev.column, row: ev.row, sheet: ev.sheetName, n: ev.n })}</div>
          {(ev.action === 'edited' || ev.action === 'added' || ev.action === 'deleted') && <div className="chips" style={c}>
            {ev.action === 'edited' && <><span className="vchip old">{ev.old || '—'}</span><span aria-hidden="true">→</span><span className="vchip new">{ev.new}</span></>}
            {ev.action === 'added' && <span className="vchip new">{ev.new}</span>}
            {ev.action === 'deleted' && <span className="vchip del">{ev.old}</span>}
          </div>}
        </div>
        <div className="when">
          <time dateTime={ev.at}>{rel(ev.at)}</time><br />
          <span><Icon name={ev.source === 'sheet' ? 'table' : 'bolt'} size={13} />{t(`source.${ev.source}`)}</span>
        </div>
      </div>
    </li>
  )
}
