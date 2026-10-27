import { useMutation } from '@tanstack/react-query'
import { Link, useRouter } from '@tanstack/react-router'
import { useTranslation } from 'react-i18next'
import { api } from '../api'
import { toastError } from '../lib'
import { Icon } from './Icon'
import { LangToggle } from './bits'

export function AuthPage({ mode, next }: { mode: 'login' | 'register'; next?: string }) {
  const { t } = useTranslation()
  const router = useRouter()
  const login = mode === 'login'

  const submit = useMutation({
    mutationFn: (f: FormData) =>
      login
        ? api('/auth/sign-in/email', { email: f.get('email'), password: f.get('password') })
        : api('/auth/sign-up/email', { name: f.get('name'), email: f.get('email'), password: f.get('password') }),
    onSuccess: async () => {
      // Guards cached "no session"; drop everything so they re-check.
      router.options.context.queryClient.clear()
      // Only same-site paths: `next` comes from the URL.
      const dest = next?.startsWith('/') && !next.startsWith('//') ? next : '/dashboard'
      await router.navigate({ href: dest })
    },
    onError: toastError,
  })

  return (
    <div className="lg">
      <section className="lg-hero">
        <div className="brand"><span className="logo"><Icon name="bolt" /></span>Relay</div>
        <div>
          <h1>{t('auth.headline')}</h1>
          <p>{t('auth.sub')}</p>
        </div>
      </section>
      <section className="lg-form">
        <div className="langpos"><LangToggle /></div>
        <form
          onSubmit={(e) => {
            e.preventDefault()
            submit.mutate(new FormData(e.currentTarget))
          }}
        >
          <h2>{login ? t('auth.signIn') : t('auth.signUp')}</h2>
          {!login && (
            <label>{t('auth.name')}<input className="rl-field-input" name="name" required autoComplete="name" /></label>
          )}
          <label>{t('auth.email')}<input className="rl-field-input" name="email" type="email" required autoComplete="username" /></label>
          <label>
            {t('auth.password')}
            <input className="rl-field-input" name="password" type="password" required minLength={login ? undefined : 8} autoComplete={login ? 'current-password' : 'new-password'} />
          </label>
          <button className="rl-btn rl-btn-primary" type="submit" disabled={submit.isPending}>{login ? t('auth.signIn') : t('auth.signUp')}</button>
          <p className="switch">
            {login ? t('auth.noAccount') : t('auth.haveAccount')}{' '}
            <Link to={login ? '/register' : '/login'} search={{ next }}>{login ? t('auth.signUp') : t('auth.signIn')}</Link>
          </p>
        </form>
      </section>
    </div>
  )
}
