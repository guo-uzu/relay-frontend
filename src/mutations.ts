import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'
import { api } from './api'
import { toastError } from './lib'

export function useImportSheet(orgId: string) {
  const qc = useQueryClient()
  const { t } = useTranslation()
  return useMutation({
    mutationFn: (connectionId: string) => api(`/google-sheets/${orgId}/import-sheet`, { connectionId }),
    onSuccess: () => {
      toast.success(t('sheets.imported'))
      return qc.invalidateQueries() // imports change dashboard, sheet list and row data at once
    },
    onError: toastError,
  })
}
