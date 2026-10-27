import { createFileRoute, redirect, useRouter } from '@tanstack/react-router'
import { useMutation } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import { api } from '../api'
import { fold, toastError } from '../lib'
import { orgsQuery, sessionQuery } from '../queries'

export const Route = createFileRoute('/onboarding')({
  beforeLoad: async ({ context: { queryClient }, location }) => {
    if (!(await queryClient.ensureQueryData(sessionQuery))) throw redirect({ to: '/login', search: { next: location.href } })
    if ((await queryClient.ensureQueryData(orgsQuery)).length) throw redirect({ to: '/dashboard' })
  },
  component: function Onboarding() {
    const { t } = useTranslation()
    const router = useRouter()
    const create = useMutation({
      mutationFn: (name: string) =>
        // Better Auth needs a unique slug; the suffix avoids collisions between same-named orgs.
        api('/auth/organization/create', { name, slug: `${fold(name).replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')}-${crypto.randomUUID().slice(0, 6)}` }),
      onSuccess: async () => {
        router.options.context.queryClient.clear()
        await router.navigate({ to: '/dashboard' })
      },
      onError: toastError,
    })
    return (
      <div className="center">
        <section className="panel">
          <h2>{t('onboarding.title')}</h2>
          <p className="hint">{t('onboarding.hint')}</p>
          <form
            className="form"
            onSubmit={(e) => {
              e.preventDefault()
              create.mutate(String(new FormData(e.currentTarget).get('name')).trim())
            }}
          >
            <label>{t('onboarding.name')}<input className="rl-field-input" name="name" required /></label>
            <button className="rl-btn rl-btn-primary" type="submit" disabled={create.isPending}>{t('onboarding.create')}</button>
          </form>
        </section>
      </div>
    )
  },
})
