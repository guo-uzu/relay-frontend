import { createFileRoute, redirect } from '@tanstack/react-router'
import { useMutation, useQueryClient, useSuspenseQuery } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'
import { api } from '../../api'
import { Avatar } from '../../components/bits'
import { Icon } from '../../components/Icon'
import { rel, toastError } from '../../lib'
import { orgQuery } from '../../queries'

export const Route = createFileRoute('/_app/team')({
  // UI-only guard; the server enforces the real rule.
  beforeLoad: ({ context }) => {
    if (!context.isAdmin) throw redirect({ to: '/dashboard' })
  },
  loader: ({ context }) => context.queryClient.ensureQueryData(orgQuery(context.orgId)),
  component: Team,
})

function Team() {
  const { t } = useTranslation()
  const { orgId, user } = Route.useRouteContext()
  const { data: org } = useSuspenseQuery(orgQuery(orgId))
  const qc = useQueryClient()
  const act = (path: string, body: object, msg?: string) =>
    api(`/auth/organization/${path}`, { ...body, organizationId: orgId }).then(() => {
      if (msg) toast.success(msg)
      return Promise.all([qc.invalidateQueries({ queryKey: ['org', orgId] }), qc.invalidateQueries({ queryKey: ['dashboard'] })])
    })
  const run = useMutation({ mutationFn: (fn: () => Promise<unknown>) => fn(), onError: toastError })
  const pending = org.invitations.filter((i) => i.status === 'pending')

  return (
    <>
      <header className="page-h rise"><div><h1>{t('team.title')}</h1><p>{t('team.subtitle')}</p></div></header>
      <div className="grid2">
        <div>
          <section className="panel rise">
            <h2>{t('team.members')}</h2>
            {org.members.map((m) => {
              const locked = m.role === 'owner' || m.userId === user.id
              return (
                <div className="person" key={m.id}>
                  <Avatar who={m.user.email} />
                  <div className="nm">
                    <b>{m.user.name}</b>{m.userId === user.id && <span className="you">{t('team.you')}</span>}
                    <small>{m.user.email}</small>
                  </div>
                  <select
                    className="rl-select" aria-label={`${t('team.role')}: ${m.user.name}`} disabled={locked} value={m.role}
                    onChange={(e) => run.mutate(() => act('update-member-role', { memberId: m.id, role: e.target.value }))}
                  >
                    {(locked ? ['owner', 'admin', 'member'] : ['admin', 'member']).map((r) => <option key={r} value={r}>{t(`team.${r as 'owner'}`)}</option>)}
                  </select>
                  {!locked && (
                    <button className="icobtn" aria-label={`${t('team.remove')}: ${m.user.name}`} onClick={() => run.mutate(() => act('remove-member', { memberIdOrEmail: m.id }))}>
                      <Icon name="x" size={17} />
                    </button>
                  )}
                </div>
              )
            })}
          </section>
          <section className="panel rise">
            <h2>{t('team.pending')}</h2>
            {pending.length === 0 && <p className="msg" style={{ marginTop: 8 }}>{t('team.noPending')}</p>}
            {pending.map((i) => (
              <div className="person" key={i.id}>
                <span className="avatar" style={{ '--c': '#8C9AAD' } as React.CSSProperties}><Icon name="mail" size={16} /></span>
                <div className="nm"><b>{i.email}</b><small>{t(`team.${i.role}`)}, {t('team.expires', { t: rel(i.expiresAt) })}</small></div>
                <button className="rl-btn" onClick={() => run.mutate(() => act('cancel-invitation', { invitationId: i.id }))}>{t('team.cancel')}</button>
              </div>
            ))}
          </section>
        </div>
        <section className="panel rise">
          <h2>{t('team.invite')}</h2>
          <form
            className="form" style={{ marginTop: 16 }}
            onSubmit={(e) => {
              e.preventDefault()
              const form = e.currentTarget
              const f = new FormData(form)
              const email = String(f.get('email')).trim()
              run.mutate(() => act('invite-member', { email, role: f.get('role') }, t('team.sent', { email })), { onSuccess: () => form.reset() })
            }}
          >
            <label>{t('team.email')}<input className="rl-field-input" type="email" name="email" required /></label>
            <label>{t('team.role')}<select className="rl-select" name="role"><option value="member">{t('team.member')}</option><option value="admin">{t('team.admin')}</option></select></label>
            <button className="rl-btn rl-btn-primary" type="submit" disabled={run.isPending} style={{ justifyContent: 'center' }}>{t('team.send')}</button>
          </form>
        </section>
      </div>
    </>
  )
}
