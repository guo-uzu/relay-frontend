import { useState } from 'react'
import { useMutation, useQueryClient, useSuspenseQuery } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import { api } from '../api'
import { useSaveHeaders } from '../mutations'
import { headersQuery } from '../queries'
import { toastError } from '../lib'
import type { HeaderConfig } from '../types'

export function HeadersForm({ orgId, sheetId, examples, onDone }: { orgId: string; sheetId: string; examples: (string | undefined)[]; onDone: () => void }) {
  const { t } = useTranslation()
  const qc = useQueryClient()
  const { data } = useSuspenseQuery(headersQuery(orgId, sheetId))
  const [draft, setDraft] = useState<HeaderConfig[]>(data)
  const save = useSaveHeaders(orgId, sheetId)
  // Persists one column's obligatory flag right away; the rows query carries headers too, so AddRow updates as well.
  const toggle = useMutation({
    mutationFn: (h: HeaderConfig) => api(`/google-sheets/${orgId}/sheets/${sheetId}/headers`, { name: h.name, obligatory: !h.obligatory }, 'PATCH'),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ['headers', orgId, sheetId] })
      return qc.invalidateQueries({ queryKey: ['rows', orgId, sheetId] })
    },
    onError: toastError,
  })

  const toggleAllElements = useMutation({
    mutationFn: (data: HeaderConfig[]) => api(`/google-sheets/${orgId}/sheets/${sheetId}/headers`, { headers: data }),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ['headers', orgId, sheetId] })
      return qc.invalidateQueries({ queryKey: ['rows', orgId, sheetId] })
    }, onError: toastError
  })

  const handleToggleAllElements = () => {
    setDraft((d) => d.map((h) => ({ ...h, obligatory: true })))
    toggleAllElements.mutate(draft)
  }

  const flip = (i: number) => {
    const h = draft[i]
    if (!h) return
    setDraft((d) => d.map((x, j) => (j === i ? { ...x, obligatory: !x.obligatory } : x)))
    toggle.mutate(h)
  }

  const n = draft.filter((h) => h.obligatory).length

  return (
    <form onSubmit={(e) => { e.preventDefault(); save.mutate(draft, { onSuccess: () => onDone() }) }}>
      <header><h2>{t('headers.title')}</h2><p>{t('headers.hint')}</p></header>
      <div className="rl-dlg-body">
        <div className="rl-hdr-bar">
          <span aria-live="polite">{t('headers.summary', { n, total: draft.length })}</span>
          <button type="button" className="rl-link" disabled={n === draft.length} onClick={handleToggleAllElements}>{t('headers.reset')}</button>
        </div>
        <ul className="rl-hdrs">
          {draft.map((h, i) => (
            <li key={h.name + i}>
              <button
                type="button"
                role="switch"
                aria-checked={h.obligatory}
                className="rl-hdr"
                onClick={() => flip(i)}
              >
                <span className="rl-hdr-name"><b>{h.name}</b>{examples[i] && <small>{t('headers.example', { v: examples[i] })}</small>}</span>
                <span className="rl-hdr-state">{t('headers.required')}</span>
                <span className="rl-knob" aria-hidden />
              </button>
            </li>
          ))}
        </ul>
      </div>

    </form>
  )
}
