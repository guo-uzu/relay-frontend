import { useState } from 'react'
import { Link, createFileRoute, redirect } from '@tanstack/react-router'
import { useMutation } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import { z } from 'zod'
import { api } from '../api'
import { Icon } from '../components/Icon'
import { toastError } from '../lib'
import { orgsQuery, sessionQuery } from '../queries'

const SHEET_URL = /^https:\/\/docs\.google\.com\/spreadsheets\/d\/([a-zA-Z0-9_-]{40,50})(?:[/?#]|$)/
const sheetLink = z.string().trim().regex(SHEET_URL, 'invalid').transform((url) => SHEET_URL.exec(url)![1]!)

export const Route = createFileRoute('/onboarding_/sheet')({
  beforeLoad: async ({ context: { queryClient }, location }) => {
    if (!(await queryClient.ensureQueryData(sessionQuery))) throw redirect({ to: '/login', search: { next: location.href } })
    const [org] = await queryClient.ensureQueryData(orgsQuery)
    if (!org) throw redirect({ to: '/onboarding' })
    return { orgId: org.id }
  },
  component: function ConnectSheet() {
    const { t } = useTranslation()
    const { orgId } = Route.useRouteContext()
    const [link, setLink] = useState('')
    const parsed = sheetLink.safeParse(link)
    const test = useMutation({
      mutationFn: (sheetId: string) => api<{ message: string; data: boolean }>(`/google-sheets/${orgId}/test-sheet`, { sheetId }),
      onError: toastError,
    })

    return (
      <div className="center">
        <section className="panel">
          <h2>{t('sheetSetup.title')}</h2>
          <p className="hint">{t('sheetSetup.hint')}</p>
          <form
            className="form"
            onSubmit={(e) => {
              e.preventDefault()
              if (parsed.success) test.mutate(parsed.data)
            }}
          >
            <label>
              {t('sheetSetup.link')}
              <input
                className="rl-field-input"
                name="link"
                type="url"
                required
                placeholder="https://docs.google.com/spreadsheets/d/..."
                value={link}
                onChange={(e) => {
                  setLink(e.target.value)
                  test.reset()
                }}
              />
            </label>
            {link && !parsed.success && <p className="rl-error" role="alert">{t('sheetSetup.invalid')}</p>}
            <button className="rl-btn rl-btn-primary" type="submit" disabled={!parsed.success || test.isPending}>
              {test.isPending ? t('sheetSetup.testing') : t('sheetSetup.test')}
            </button>
          </form>
          {test.isSuccess && (
            <p className={`sheet-test ${test.data.data ? 'ok' : 'bad'}`} role="status">
              <Icon name={test.data.data ? 'check' : 'x'} />
              {test.data.data ? t('sheetSetup.ok') : t('sheetSetup.fail')}
            </p>
          )}
          {test.data?.data && <Link className="rl-btn" to="/dashboard">{t('sheetSetup.continue')}</Link>}
        </section>
      </div>
    )
  },
})
