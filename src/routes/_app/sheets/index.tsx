import type React from 'react'
import { Link, createFileRoute } from '@tanstack/react-router'
import { useMutation, useQuery, useQueryClient, useSuspenseQuery } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'
import { api } from '../../../api'
import { Icon } from '../../../components/Icon'
import { num, rel, toastError } from '../../../lib'
import { useImportSheet } from '../../../mutations'
import { historyQuery, sheetsQuery } from '../../../queries'
import { EMPTY_SEARCH } from '../../../types'

export const Route = createFileRoute('/_app/sheets/')({
  loader: ({ context }) => context.queryClient.ensureQueryData(sheetsQuery(context.orgId)),
  component: Sheets,
})

function Sheets() {
  const { t } = useTranslation()
  const { orgId, isAdmin } = Route.useRouteContext()
  const { data: sheets } = useSuspenseQuery(sheetsQuery(orgId))
  const { data: logs = [] } = useQuery(historyQuery(orgId))
  const qc = useQueryClient()
  const importSheet = useImportSheet(orgId)

  const connect = useMutation({
    mutationFn: (f: FormData) => {
      const raw = String(f.get('sheetId')).trim()
      // Accepts a pasted Google Sheets URL or the bare id.
      return api(`/google-sheets/${orgId}/set-sheet-id`, {
        sheetId: raw.match(/\/d\/([\w-]+)/)?.[1] ?? raw,
        nameSheet: String(f.get('tab')).trim(),
      })
    },
    onSuccess: () => {
      toast.success(t('sheets.connected'))
      void qc.invalidateQueries({ queryKey: ['sheets', orgId] })
      void qc.invalidateQueries({ queryKey: ['history', orgId] })
    },
    onError: toastError,
  })

  const handleImport = (sheetId: string) => {
    importSheet.mutate(sheetId, {
      onSuccess: () => {
        void qc.invalidateQueries({ queryKey: ['history', orgId] })
      },
    })
  }

  return (
    <>
      <header className="page-h rise">
        <div>
          <h1>{t('sheets.title')}</h1>
          <p>{t('sheets.hint')}</p>
        </div>
      </header>

      <section className="panel rise" style={{ '--i': 1 } as React.CSSProperties}>
        {sheets.length === 0 && <p className="msg">{t('sheets.empty')}</p>}
        {sheets.map((s) => (
          <div className="sheetrow" key={s.id}>
            <Link className="nm sheetlink" to="/sheets/$sheetId" params={{ sheetId: s.id }} search={EMPTY_SEARCH}>
              <b>{s.name}</b>
              <small>
                {t('sheets.rowsN', { n: num(s.rowCount) })}
                {s.importedAt && `, ${t('sheets.importedAgo', { t: rel(s.importedAt) })}`}
              </small>
            </Link>
            {isAdmin && (
              <button
                className="icobtn"
                disabled={importSheet.isPending}
                onClick={() => handleImport(s.id)}
                aria-label={`${s.importedAt ? t('dash.reimport') : t('dash.import')}: ${s.name}`}
              >
                <Icon name="refresh" size={17} />
              </button>
            )}
          </div>
        ))}
      </section>

      {isAdmin && (
        <section className="panel rise" style={{ '--i': 2 } as React.CSSProperties}>
          <h2>{t('sheets.connect')}</h2>
          <form
            className="form-inline"
            style={{ marginTop: 16 }}
            onSubmit={(e) => {
              e.preventDefault()
              const form = e.currentTarget
              connect.mutate(new FormData(form), { onSuccess: () => form.reset() })
            }}
          >
            <label>
              {t('sheets.spreadsheetId')}
              <input className="rl-field-input" name="sheetId" required />
            </label>
            <label>
              {t('sheets.tab')}
              <input className="rl-field-input" name="tab" required />
            </label>
            <button className="rl-btn rl-btn-primary" type="submit" disabled={connect.isPending}>
              {t('sheets.connectSubmit')}
            </button>
          </form>
        </section>
      )}

      <section className="panel rise" style={{ '--i': 3, marginTop: 24 } as React.CSSProperties}>
        <h2>Historial de actividad</h2>
        {logs.length === 0 ? (
          <p className="msg" style={{ marginTop: 12 }}>
            No hay registros de actividad aún.
          </p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginTop: 16 }}>
            {logs.map((log) => (
              <div
                key={log.id}
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  paddingBottom: 8,
                  borderBottom: '1px solid rgba(0, 0, 0, 0.08)',
                }}
              >
                <span>{log.action}</span>
                <small style={{ opacity: 0.6 }}>{rel(log.createdAt)}</small>
              </div>
            ))}
          </div>
        )}
      </section>
    </>
  )
}