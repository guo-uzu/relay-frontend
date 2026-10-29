import { queryOptions } from '@tanstack/react-query'
import { api } from './api'
import type { Dashboard, Org, RowsResult, SheetSummary, Session, TableSearch } from './types'

export const PAGE_SIZE = 20
export const tz = Intl.DateTimeFormat().resolvedOptions().timeZone

export const sessionQuery = queryOptions({ queryKey: ['session'], queryFn: () => api<Session>('/auth/get-session') })

export const orgsQuery = queryOptions({ queryKey: ['orgs'], queryFn: () => api<{ id: string }[]>('/auth/organization/list') })

export const orgQuery = (orgId: string) =>
  queryOptions({ queryKey: ['org', orgId], queryFn: () => api<Org>(`/auth/organization/get-full-organization?organizationId=${orgId}`) })

export const dashboardQuery = (orgId: string) =>
  queryOptions({
    queryKey: ['dashboard', orgId, tz],
    queryFn: () => api<Dashboard>(`/orgs/${orgId}/dashboard?tz=${encodeURIComponent(tz)}`),
    refetchInterval: 30_000,
  })

export const sheetsQuery = (orgId: string) =>
  queryOptions({
    queryKey: ['sheets', orgId],
    queryFn: async (): Promise<SheetSummary[]> => {
      return [
        {
          id: 'sheet-1',
          name: 'Peticiones SGG 2025-2027',
          rowCount: 16,
          importedAt: new Date().toISOString(),
        },
      ]
    },
  })

export const rowsQuery = (orgId: string, sheetId: string, s: TableSearch) =>
  queryOptions({
    queryKey: ['rows', orgId, sheetId, s],
    queryFn: async (): Promise<RowsResult> => {
      return {
        sheetName: 'Peticiones SGG 2025-2027',
        headers: ['Nombre del Solicitante', 'Dirección', 'Colonia / Sector', 'Municipio', 'Teléfono', 'Apoyo Solicitado'],
        rows: [
          { n: 1, cells: ['CARMELINA ROBLEDO SOTO', '5 DE MAYO', 'LUIS DONALDO COLOSIO', 'GRAL. ZARAGOZA', '826 114 51 97', 'DESPENSA'] },
          { n: 2, cells: ['ELENA VARGAS GATICA', 'DIORITA #6113', 'SAN BERNABE', 'MONTERREY', '8120937878', 'SILLA DE RUEDAS'] },
          { n: 3, cells: ['JULIA GUERRERO GALLEGOS', 'AVE DEL PARAISO #5837', 'VALLE VERDE 2DO SEC', 'MONTERREY', '8129268904', 'SILLA DE RUEDAS'] },
          { n: 4, cells: ['FAUSTINO MONJARAZ REYES', 'EPICALIO 1953', 'FOMERREY 24', 'MONTERREY', '8134668629', 'SILLA DE RUEDAS'] },
          { n: 5, cells: ['HECTOR PEREZ RODRIGUEZ', 'NO VIENE DIRECCION', 'FRACC VALLE DE SANTA ELENA SECTOR', 'APODACA', '8126231191', 'DESPENSA'] },
          { n: 6, cells: ['LEOPOLDO HERNANDEZ DOMINGUEZ', 'SE NATIVIDAD REZA 1', 'SAN JOSE SUR', 'MONTERREY', '8119788710', 'SILLA DE RUEDAS'] },
          { n: 7, cells: ['JUANA DE LA TORRE MENDOZA', 'NIÑO ARTILLERO 1210', 'NIÑO ARTILLERO', 'MONTERREY', '81 3108 7831', 'SILLA DE RUEDAS'] },
          { n: 8, cells: ['ANDREA HERNANDEZ MOYA', 'OLIVOS 1725', 'NOGALES DE LA SIERRA', 'MONTERREY', '8122944302', 'DESPENSA'] },
          { n: 9, cells: ['GLORIA RODRIGUEZ SANDOVAL', 'PASEO DE LA COLONIA 1344', 'FOMERREY 1 ( REFORMA )', 'MONTERREY', '8120119427', 'DESPENSA'] },
          { n: 10, cells: ['ADRIANA YARETZY SOLIS REYNA', 'SANTA ANITA 1505', 'BOSQUES DE LA ESTANZUELA', 'MONTERREY', '8186811261', 'DESPENSA'] },
          { n: 11, cells: ['CAROLINA YAMILETH GAONA RODRIGUEZ', 'PASEO DE LA COLINA 1344', 'FOMERREY 45', 'MONTERREY', '8187775946', 'DESPENSA'] },
          { n: 12, cells: ['NIMIA RAMONA SUAZO MARTINEZ', 'CONDOR 208', 'VILLAS DE SAN FRANCISCO', 'GRAL. ESCOBEDO', '8119191325', 'DESPENSA'] },
          { n: 13, cells: ['NELLY JUDITH RODRIGUEZ FLORES', 'CONDOR 202', 'VILLAS DE SAN FRANCISCO', 'GRAL. ESCOBEDO', '8143636762', 'DESPENSA'] },
          { n: 14, cells: ['JULIO CÉSAR GARCÍA MORENO', 'GOLONDRINAS #130 B', 'FRACC EL JARAL', 'CARMEN', '812 893 21 84', 'SE CANALIZO A DIF'] },
          { n: 15, cells: ['MARÍA TERESA JUÁREZ MARTINEZ', 'TREBOL 100', 'MIRASOL', 'MONTERREY', '818 465 46 08 / 813 531 21 91', 'DESPENSA'] },
          { n: 16, cells: ['JESSICA IVETTE DE LEON CARDOZA', 'JESUS GARCIA #2301', 'SIERRA VENTANA', 'MONTERREY', '8132603986', 'CAMA DE HOSPITAL'] },
        ],
        total: 16,
      }
    },
  })