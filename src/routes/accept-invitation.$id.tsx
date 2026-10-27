import { createFileRoute, redirect, useRouter } from '@tanstack/react-router'
import { useMutation } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import { api } from '../api'
import { toastError } from '../lib'
import { sessionQuery } from '../queries'

export const Route = createFileRoute('/accept-invitation/$id')({
  beforeLoad: async ({ context: { queryClient }, location }) => {
    if (!(await queryClient.ensureQueryData(sessionQuery))) throw redirect({ to: '/login', search: { next: location.href } })
  },
  component: function AcceptInvitation() {
    const { t } = useTranslation()
    const { id } = Route.useParams()
    const router = useRouter()
    const accept = useMutation({
      mutationFn: () => api('/auth/organization/accept-invitation', { invitationId: id }),
      onSuccess: async () => {
        router.options.context.queryClient.clear()
        await router.navigate({ to: '/dashboard' })
      },
      onError: toastError,
    })
    return (
      <div className="center">
        <section className="panel">
          <h2>{t('invite.title')}</h2>
          <p className="hint">{t('invite.hint')}</p>
          <button className="rl-btn rl-btn-primary" onClick={() => accept.mutate()} disabled={accept.isPending}>{t('invite.accept')}</button>
        </section>
      </div>
    )
  },
})
