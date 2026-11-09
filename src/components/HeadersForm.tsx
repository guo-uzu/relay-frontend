import { useState } from 'react'
import { useSuspenseQuery } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import { useSaveHeaders } from '../mutations'
import { headersQuery } from '../queries'
import type { HeaderConfig } from '../types'

export function HeadersForm({ orgId, sheetId, onDone }: { orgId: string; sheetId: string; onDone: () => void }) {
  const { t } = useTranslation()
  const { data } = useSuspenseQuery(headersQuery(orgId, sheetId))
  const [draft, setDraft] = useState<HeaderConfig[]>(data)
  const save = useSaveHeaders(orgId, sheetId)
  const n = draft.filter((h) => h.optional).length

  return (
    <form onSubmit={(e) => { e.preventDefault(); save.mutate(draft, { onSuccess: () => onDone() }) }}>
      <header><h2>{t('headers.title')}</h2><p>{t('headers.hint')}</p></header>
      <div className="rl-hdr-bar">
        <span aria-live="polite">{t('headers.summary', { n, total: draft.length })}</span>
        <button type="button" className="rl-link" disabled={!n} onClick={() => setDraft((d) => d.map((h) => ({ ...h, optional: false })))}>{t('headers.reset')}</button>
      </div>
      <ul className="rl-hdrs">
        {draft.map((h, i) => (
          <li key={h.name + i}>
            <button
              type="button"
              role="switch"
              aria-checked={h.optional}
              className="rl-hdr"
              onClick={() => setDraft((d) => d.map((x, j) => (j === i ? { ...x, optional: !x.optional } : x)))}
            >
              <span className="rl-hdr-name">{h.name}</span>
              <span className="rl-hdr-state">{t(h.optional ? 'headers.optional' : 'headers.required')}</span>
              <span className="rl-knob" aria-hidden />
            </button>
          </li>
        ))}
      </ul>
      <footer>
        <button type="button" className="rl-btn" onClick={() => { setDraft(data); onDone() }}>{t('headers.cancel')}</button>
        <button className="rl-btn rl-btn-primary" type="submit" disabled={save.isPending}>{t('headers.save')}</button>
      </footer>
    </form>
  )
}
