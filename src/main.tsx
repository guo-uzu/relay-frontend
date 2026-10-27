import './i18n'
import './styles.css'
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { RouterProvider, createRouter } from '@tanstack/react-router'
import { Toaster } from 'sonner'
import { useTranslation } from 'react-i18next'
import { routeTree } from './routeTree.gen'

const queryClient = new QueryClient()

function RouteError({ reset }: { reset: () => void }) {
  const { t } = useTranslation()
  return (
    <div className="center">
      <div className="panel">
        <p>{t('error.loading')}</p>
        <button className="rl-btn" onClick={reset}>↻</button>
      </div>
    </div>
  )
}

const router = createRouter({
  routeTree,
  context: { queryClient },
  defaultViewTransition: true,
  defaultPreload: 'intent',
  defaultErrorComponent: RouteError,
})

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router
  }
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <RouterProvider router={router} />
      <Toaster position="bottom-right" />
    </QueryClientProvider>
  </StrictMode>,
)
