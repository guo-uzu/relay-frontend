import { Link, Outlet, createFileRoute, redirect, useRouter } from '@tanstack/react-router'
import { useMutation, useQueryClient, useSuspenseQuery } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import { api } from '../api'
import { Icon } from '../components/Icon'
import { Avatar, LangToggle } from '../components/bits'
import { orgQuery, orgsQuery, sessionQuery } from '../queries'

export const Route = createFileRoute('/_app')({
  beforeLoad: async ({ context: { queryClient }, location }) => {
    const session = await queryClient.ensureQueryData(sessionQuery)
    if (!session) throw redirect({ to: '/login', search: { next: location.href } })
    const [org] = await queryClient.ensureQueryData(orgsQuery)
    if (!org) throw redirect({ to: '/onboarding' })
    const full = await queryClient.ensureQueryData(orgQuery(org.id))
    const role = full.members.find((m) => m.userId === session.user.id)?.role ?? 'member'
    return { user: session.user, orgId: org.id, role, isAdmin: role !== 'member' }
  },
  component: Shell,
})

function Shell() {
  const { t } = useTranslation()
  const { user, orgId, role, isAdmin } = Route.useRouteContext()
  const { data: org } = useSuspenseQuery(orgQuery(orgId))
  const qc = useQueryClient()
  const router = useRouter()
  const signOut = useMutation({
    mutationFn: () => api('/auth/sign-out', {}),
    onSettled: async () => {
      qc.clear()
      await router.navigate({ to: '/login' })
    },
  })

  return (
    <div className="app">
      <aside className="side">
        <div className="brand"><span className="logo"><Icon name="bolt" /></span>Relay</div>
        <div className="orgcard"><b>{org.name}</b><span>{t(`team.${role}`)}</span></div>
        <nav className="nav" aria-label="Main">
          <Link to="/dashboard"><Icon name="dashboard" size={19} />{t('nav.dashboard')}</Link>
          <Link to="/sheets"><Icon name="table" size={19} />{t('nav.data')}</Link>
          {isAdmin && <Link to="/team"><Icon name="users" size={19} />{t('nav.team')}</Link>}
        </nav>
        <div className="foot">
          <LangToggle />
          <div className="meuser"><Avatar who={user.email} /><div><b>{user.name}</b><small>{user.email}</small></div></div>
          <button className="signout" onClick={() => signOut.mutate()}><Icon name="logout" />{t('nav.signOut')}</button>
        </div>
      </aside>
      <main className="main" id="main"><Outlet /></main>
    </div>
  )
}
