import { createFileRoute } from '@tanstack/react-router'
import { AuthPage } from '../components/Auth'

export const Route = createFileRoute('/login')({
  validateSearch: (s: Record<string, unknown>): { next?: string } => ({ next: typeof s.next === 'string' ? s.next : undefined }),
  component: function Login() {
    return <AuthPage mode="login" next={Route.useSearch().next} />
  },
})
