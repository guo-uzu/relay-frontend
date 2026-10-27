import { createFileRoute } from '@tanstack/react-router'
import { AuthPage } from '../components/Auth'

export const Route = createFileRoute('/register')({
  validateSearch: (s: Record<string, unknown>): { next?: string } => ({ next: typeof s.next === 'string' ? s.next : undefined }),
  component: function Register() {
    return <AuthPage mode="register" next={Route.useSearch().next} />
  },
})
