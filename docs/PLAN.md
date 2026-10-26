# Relay frontend: plan del MVP (v4)

Estado: fase de diseño. Hay tres opciones de diseño estáticas en `design/` (abre `design/index.html`). El scaffold de la app todavía no empieza.

La versión en inglés está en `docs/PLAN.en.md`.

## 1. Contexto

- **Backend:** Express 5 + TypeScript, API REST en JSON, Better Auth (sesión por cookie, plugin de organizaciones), Drizzle + PostgreSQL, Zod. Todavía no hay spec OpenAPI.
- **Qué hace Relay:** una organización conecta pestañas de Google Sheets, las importa a PostgreSQL (una copia que se reemplaza en cada importación) y el equipo busca y filtra esos datos. También se pueden agregar filas desde la plataforma, que se escriben en Google Sheets.
- **Tipo de app:** panel detrás de un login. No necesita SEO ni renderizado en servidor, por eso es una SPA.
- **Alcance:** es un MVP. Primero resultados y algo funcional; la seguridad y los detalles se afinan mientras los usuarios lo usan.

## 2. Decisiones

| Tema | Decisión |
|---|---|
| Framework | Vite + React + TypeScript (strict), pnpm. SPA, sin SSR. Next.js no se usa: ya existe el backend Express y no se necesita SEO. |
| Rutas | TanStack Router, rutas por archivos, `defaultViewTransition: true` para transiciones entre páginas |
| Datos del servidor | TanStack Query. Los loaders de cada ruta llaman `ensureQueryData` y los componentes usan `useSuspenseQuery`. Se actualizan con `refetchInterval` (sin websockets). |
| Formularios | TanStack Form + Zod |
| Tabla | TanStack Table en modo servidor (`manualFiltering`, `manualSorting`, `manualPagination`) |
| Debounce | TanStack Pacer |
| Autenticación | Llamadas directas a los endpoints de Better Auth, envueltas en mutaciones de TanStack Query. Sesión por cookie manejada por el servidor. Sin la librería cliente de Better Auth. Google OAuth queda para después. |
| UI | Tailwind v4 + shadcn/ui, toasts con sonner, `motion` para animaciones de componentes |
| Idiomas | Inglés y español (i18next + react-i18next, claves tipadas, `Intl` para fechas y números). Los mensajes de error del backend se mapean por código. |
| Búsqueda | El backend hace el trabajo pesado. El frontend solo envía términos y filtros, cada grupo con AND/OR. El resaltado lo hace el frontend (sin distinguir acentos ni mayúsculas). |
| TanStack DB | No por ahora. Solo leemos y agregamos filas, así que Query es suficiente. Se reconsidera si llega la edición de filas o la sincronización en tiempo real. |
| Mocks (MSW) | No por ahora. Se reconsidera con la reescritura a Nest (OpenAPI + orval pueden generar el cliente y los mocks). |
| Fechas | Se guardan como `timestamptz`, se devuelven en ISO 8601 UTC y el navegador las convierte. Todo lo que se agrupa por día recibe `?tz=<zona IANA>`. |
| Historial | Una sola tabla. `source` es `sheet` o `platform`. `actor` es texto libre (un correo), sin relación con los usuarios de la plataforma. |

### Zona horaria

No se guarda el offset del usuario, se guarda el **momento exacto en UTC**. Una edición a las 23:00 en Ciudad de México del 26 de octubre se guarda como 05:00 UTC del 27 de octubre. El servidor devuelve `"2026-10-27T05:00:00Z"` a todos y cada navegador lo muestra en su hora local.

Para contar "hoy" y agrupar por día, el frontend manda `?tz=America/Mexico_City` (de `Intl.DateTimeFormat().resolvedOptions().timeZone`) y el backend agrupa con `date_trunc('day', created_at AT TIME ZONE $tz)`.

Cambio en el backend: el esquema usa `timestamp(...)` sin zona horaria. Hay que cambiarlo a `timestamp(..., { withTimezone: true })` en `history` e `importedAt`.

## 3. Permisos (MVP)

| Acción | Quién |
|---|---|
| Ver el dashboard y la tabla de datos | Todos los miembros |
| Agregar una fila (escribe en Google Sheets) | **Todos los miembros** |
| Conectar e importar hojas | Admins y propietario |
| Organización, miembros e invitaciones | Admins y propietario |

Las pantallas de admin se ocultan a los miembros, pero la regla la hace cumplir el servidor. Se puede cambiar más adelante.

## 4. Pantallas y rutas

```
/login  /register  /accept-invitation/$id        públicas
/_app   guard: sin sesión -> /login; sin organización -> /onboarding
  /onboarding        crear la organización (máximo una por usuario)
  /dashboard         reportes de hoy, últimas 15 acciones, gráfica de 30 días, más activos, estado de las hojas, lugares
  /sheets            lista, conectar, importar
  /sheets/$sheetId   tabla de datos (todos los miembros), estado de la búsqueda en la URL
  /org/members  /org/invitations  /org/settings      admins
```

El router guarda la sesión y el rol del miembro activo en su contexto. Los guards leen de ahí en vez de pedirlos en cada página.

## 5. Cómo se piden los datos

- **Lecturas:** una fábrica `queryOptions` por feature. El loader precarga con `ensureQueryData` y el componente lee con `useSuspenseQuery`, así la página aparece con datos y luego sigue actualizándose.
- **Escrituras:** cada botón llama un `useMutation`. Al terminar invalida las queries afectadas y muestra un toast traducido; si falla, muestra un toast de error.
- **`api.ts`:** un solo wrapper de `fetch` (`credentials: 'include'`) que abre `{ message, data }` y lanza un `ApiError` con el código de estado.
- **401:** cualquier 401 limpia la sesión y manda a `/login`.
- **Polling:** dashboard cada 30 s, lista de hojas cada 60 s, tabla de filas sin polling (se vuelve a pedir al cambiar los filtros). El polling se pausa si la pestaña está oculta.
- **Dev:** Vite hace proxy de `/api` a `localhost:3000`, así que el navegador y el backend comparten origen y las cookies funcionan.

## 6. Funcionalidades

### 6.1 Autenticación
- Login y registro llaman `POST /auth/sign-in/email` y `/auth/sign-up/email`. Cerrar sesión: `POST /auth/sign-out`. Sesión: `GET /auth/get-session`.
- Después del registro el usuario va a `/onboarding` a crear su organización y se establece como activa.
- Backend: no requiere cambios.

### 6.2 Dashboard
Se arma con una sola petición, `GET /orgs/:orgId/dashboard?tz=...`, que se actualiza cada 30 s.

Widgets:
1. **Reportes de hoy:** número de acciones del día en la tabla `history` (editado, agregado, eliminado, importado, conectado), con desglose por tipo.
2. **Últimas 15 acciones:** quién, qué hoja, fila/columna, valor anterior → nuevo, y cuándo. Cada una indica su origen (Google Sheets o Relay).
3. **Estadísticas:** hojas, filas totales, acciones de los últimos 7 días, miembros.
4. **Gráfica de actividad** de los últimos 30 días, una serie por tipo de acción.
5. **Más activos** de la semana (top 5).
6. **Estado de las hojas:** última importación, etiqueta de desactualizada (más de N días) y botón para volver a importar.
7. **Lugares:** miembros usados contra el límite del plan (5 en free, 50 en pro).

Respuesta propuesta:
```json
{
  "stats": { "sheets": 4, "rows": 870, "events7d": 177, "members": 3, "memberLimit": 5 },
  "today": { "added": 12, "edited": 21, "deleted": 1, "imported": 2, "connected": 1 },
  "activity": [{ "date": "2026-10-26", "added": 12, "edited": 21, "deleted": 1, "imported": 2, "connected": 1 }],
  "topActors": [{ "actor": "ana@empresa.mx", "count": 54 }],
  "recent": [ /* 15 acciones */ ]
}
```

### 6.3 Gestión de la organización (solo admins)
- **Miembros:** listar, cambiar rol (owner/admin/member) y quitar. Envuelve `auth.api.listMembers`, `updateMemberRole`, `removeMember`.
- **Invitaciones:** invitar por correo y rol, listar pendientes, cancelar y aceptar. En el MVP `sendInvitationEmail` solo registra el enlace `/accept-invitation/:id` en consola para que un admin lo copie.
- **Ajustes:** renombrar la organización.
- Los endpoints propios (`/api/v1/orgs/:orgId/...`) devuelven el mismo formato `{ message, data }` que el resto de la API y por dentro envuelven `auth.api.*`.

### 6.4 Hojas: lista, conectar, importar
- **Lista:** nombre, número de filas, fecha de importación.
- **Conectar (admin):** se pega la URL de Google Sheets; el frontend extrae el ID con `REGEX_SHEETS_URL` y llama `POST /google-sheets/:orgId/set-sheet-id`.
- **Importar (admin):** `POST /google-sheets/:orgId/import-sheet`, luego se refresca la lista.
- Backend nuevo: `GET /google-sheets/:orgId/sheets` → `[{ id, name, rowCount, headers, importedAt }]`.
- Conectar e importar escriben una fila en `history` con `source: "platform"`.

### 6.5 Tabla de datos con filtrado en el servidor
Petición: `POST /google-sheets/:orgId/sheets/:sheetId/rows` (POST porque el objeto de filtros puede crecer).
```json
{
  "search":  { "terms": ["acme", "2026"], "mode": "and" },
  "filters": { "mode": "or", "rules": [{ "column": "Estado", "op": "contains", "value": "pagado" }] },
  "sort": { "column": "Fecha", "dir": "desc" },
  "page": 1, "pageSize": 50
}
```
- `search`: cada término puede coincidir en cualquier columna. `mode` decide si la fila debe cumplir todos (`and`) o al menos uno (`or`).
- `filters`: cada regla apunta a una columna y las reglas se combinan con su propio AND/OR.
- `op`: `contains | equals | startsWith | gt | lt | isEmpty`.
- Los dos grupos (búsqueda y filtros) siempre se combinan con AND.
- Respuesta: `{ headers, rows: [{ index, cells }], total, page, pageSize }`. Las columnas se construyen en tiempo de ejecución a partir de `headers`, así funciona con cualquier hoja.
- **Acceso:** todos los miembros de la organización.
- **Estado en la URL:** términos, filtros, orden y página viven en la URL, validados con Zod en `validateSearch`, para compartir enlaces y que el botón atrás funcione.
- **Fetch:** `['rows', sheetId, params]` con `placeholderData: keepPreviousData`; lo que se escribe se retrasa unos 300 ms con Pacer.
- **Interfaz:** chips por cada término con interruptor "Todos / Cualquiera", constructor de filtros con su propio interruptor, encabezados ordenables y paginación.
- **Backend:** con el snapshot actual (un solo jsonb) se puede filtrar con `jsonb_array_elements`. Pasar a una tabla `sheet_row`, como ya dice el comentario del esquema, lo hará más fácil y rápido.

### 6.6 Resaltado de coincidencias
- El frontend ya conoce los términos que envió, así que los resalta. Un componente `<Highlight text terms />` (unas 20 líneas, sin dependencias) escapa cada término, busca coincidencias y las envuelve en `<mark>`. Alternativa lista para usar: `react-highlight-words`.
- **Acentos:** si el backend ignora acentos ("cafe" encuentra "Café"), el resaltador debe normalizar igual. Si no, la fila aparece pero sin resaltar. Los prototipos ya lo hacen así.
- `@tanstack/highlight` no sirve para esto: resalta sintaxis de código en documentación, no términos de búsqueda.

### 6.7 Agregar fila (todos los miembros)
- **Frontend:** botón "Agregar fila" en la barra de la tabla. Abre un diálogo con **TanStack Form**, un campo por columna (`headers`), y exige al menos un campo lleno. Al enviar, una mutación manda la fila; si sale bien invalida `rows`, `sheets` y `dashboard` y muestra un toast. Si falla, el diálogo se queda abierto con lo escrito.
- **Contrato:**
```
POST /api/v1/google-sheets/:orgId/sheets/:sheetId/rows/append
Body: { "cells": { "Cliente": "Acme", "Estado": "pagado", "Fecha": "2026-10-26" } }
201:  { "message": "Row added", "data": { "index": 341, "cells": ["Acme","pagado","2026-10-26"], "addedAt": "2026-10-27T05:00:00Z" } }
400 cuerpo inválido, 403 sin permiso, 404 hoja no encontrada, 409 los encabezados cambiaron (hay que reimportar), 502 error de la API de Google
```
- **Flujo del backend:**
  1. Verificar que quien llama es miembro de la organización.
  2. Alinear los valores de `cells` con los `headers` guardados; si una clave no es un encabezado, responder 409.
  3. Llamar `sheets.spreadsheets.values.append` con `valueInputOption: "USER_ENTERED"` e `insertDataOption: "INSERT_ROWS"`.
  4. Solo después de que Google confirme, agregar la fila al snapshot de la base de datos (así no se registran filas que nunca llegaron a Google).
  5. Escribir en `history` con `source: "platform"`, `action: "added"`, `actor: <correo>` y `details: { row, cells }`.
- El cliente de Google ya pide el alcance completo `spreadsheets`. La cuenta de servicio debe estar compartida como **Editor** en cada hoja.
- Las escrituras por la API normalmente no disparan el `onEdit` de Apps Script, así que el webhook no debería registrar la fila dos veces. Hay que comprobarlo en una hoja.

### 6.8 Tabla `history` unificada
```
history
  id, organizationId, sheetId (opcional, referencia a la hoja conectada)
  source:    "sheet" | "platform"
  actor:     texto   -- correo/nombre del payload de Apps Script, o el correo del usuario de la plataforma
  action:    "added" | "edited" | "deleted" | "imported" | "connected" | ...
  details:   jsonb   -- { row, column, old, new } en ediciones de la hoja
  createdAt: timestamptz
```
- No importa quién edite la hoja de Google: solo se quiere ver quién hace qué. No hay llave foránea a los usuarios de la plataforma.
- **Reportes de hoy:** conteo de acciones del día. **Últimas 15:** orden descendente con límite 15. **Gráfica y más activos:** agrupados por `action` y `actor`.
- El webhook `/updates` hoy solo imprime en consola; debe guardar sus eventos aquí.

### 6.9 Idiomas
- Inglés y español desde el inicio. Selector en el menú del usuario, guardado en `localStorage`.
- Se traduce la interfaz, no los datos de las hojas (encabezados y valores son contenido del usuario).
- Fechas y números con `Intl`. Los textos con plural usarán formato ICU en la app real.

## 7. Diseño y movimiento

Se hicieron tres prototipos estáticos con los mismos datos y comportamiento (`design/`, abre `design/index.html`):

| | A. Ledger | B. Dispatch | C. Observatory |
|---|---|---|---|
| Idea | Se parece a una hoja de cálculo: barra de fórmulas, pestañas de hoja abajo, feed como cuadrícula con números de fila reales | Feed en vivo: barra lateral, línea de tiempo y el conteo de hoy como barra proporcional | La gráfica de 30 días va primero; los botones de la leyenda activan o apagan cada acción |
| Aspecto | Claro, verde y amarillo marcador, denso | Claro azul niebla y ultramar, suave y redondeado | Oscuro (ciruela) con cinco colores de datos |
| Movimiento | Mínimo; un evento nuevo parpadea como una celda editada | Los eventos nuevos se deslizan a la línea de tiempo; una línea de progreso cuenta hasta el próximo polling; las páginas cambian con fundido | Las barras crecen una vez al cargar; Agregar fila abre como panel lateral; los toasts caen desde arriba |
| Ideal para | Quien revisa muchas filas | Equipos mixtos donde casi todos solo miran | Admins que vigilan patrones de actividad |

Recomendación: **B (Dispatch)** para un equipo mixto; C es el más fuerte en el dashboard pero solo es oscuro; A es el más eficiente pero el menos amigable. Se pueden mezclar.

Reglas de movimiento (de las skills de Emil Kowalski):
- Animar solo lo que se ve ocasionalmente; nada en acciones del teclado.
- Duraciones menores a 300 ms, curvas `ease-out` personalizadas, nunca `ease-in`.
- Solo `transform` y `opacity`; transiciones CSS en vez de keyframes para elementos que cambian rápido.
- Botones con `scale(.97)` al presionar; los popovers salen desde su disparador.
- Se respeta `prefers-reduced-motion`.
- Transiciones entre páginas con las view transitions del router; la librería `motion` solo para diálogos, contadores y listas.

## 8. Skills instaladas

`shadcn`, `frontend-design`, `web-design-guidelines`, `emil-design-eng`, `review-animations`, `animation-vocabulary` y `animation-performance`. Están en `~/.agents/skills` y `~/.claude/skills`. Para TanStack se usará el instalador oficial (`npx @tanstack/intent@latest install`) en vez de skills de la comunidad.

## 9. Herramientas de mantenimiento

- Estructura por features (`features/auth`, `organizations`, `dashboard`, `sheets`, `components/ui`, `lib`). Cada feature expone solo su `index.ts` y no importa lo interno de otra.
- ESLint (typescript-eslint, más `eslint-plugin-boundaries` o `dependency-cruiser` para las fronteras), Prettier, lefthook o husky + lint-staged, **Knip** para código muerto, Vitest + Testing Library, Playwright para unos pocos flujos (login, crear organización, importar hoja), Renovate o Dependabot.
- Un `CLAUDE.md` en el frontend con las reglas de carpetas, las librerías elegidas y lo que no se debe hacer.
- Cambios pequeños, y exigir que pasen tipos y lint antes de aceptar código generado por IA.

## 10. Orden de construcción

1. Scaffold (Vite, TS, Tailwind, shadcn, Router, Query, i18n, proxy `/api` -> `:3000`, `api.ts`, ESLint, Prettier, `CLAUDE.md` con las convenciones).
2. `docs/BACKEND_API.md`: el contrato que el backend debe implementar (formato de petición y respuesta de cada endpoint).
3. Páginas de autenticación, guards y onboarding.
4. Layout de la app en la dirección de diseño elegida.
5. Lista de hojas, conectar e importar.
6. Tabla de datos: búsqueda, AND/OR, filtros, resaltado y Agregar fila.
7. Miembros, invitaciones y ajustes de la organización.
8. Dashboard (al final porque depende del nuevo almacenamiento en el backend).

## 11. Cambios en el backend (los haces tú)

1. `trustedOrigins` con el origen de desarrollo (Better Auth valida el encabezado `Origin` aunque se use el proxy).
2. `GET /google-sheets/:orgId/sheets`.
3. `POST /google-sheets/:orgId/sheets/:sheetId/rows` (búsqueda, filtros, orden y paginación).
4. `POST /google-sheets/:orgId/sheets/:sheetId/rows/append` (Agregar fila).
5. Tabla `history` con `source`, `actor`, `action`, `details`, `sheetId` y fechas `timestamptz`; el webhook escribe ahí.
6. `GET /orgs/:orgId/dashboard?tz=...`
7. Endpoints de organización que envuelven `auth.api.*`, y un stub de `sendInvitationEmail` que registre el enlace.
8. La cuenta de servicio debe ser **Editor** en cada hoja (necesario para Agregar fila).

Detectados al explorar el backend (se dejan para después del MVP, como acordamos):
- El router de hojas también está montado en `/api/v1/webhook` sin `requireAuth`, así que las rutas de organización quedan accesibles sin login.
- Las rutas escriben el campo `name`, pero el esquema lo llama `nameSheet`, así que el nombre de la hoja podría no guardarse.
- No hay CORS ni `trustedOrigins` configurado.
- La falta de un índice único `(organization_id, sheet_id, google_tab_id)` permite registrar la misma hoja dos veces por una condición de carrera.

## 12. Preguntas abiertas

- ¿Qué dirección de diseño: A Ledger, B Dispatch, C Observatory, o una mezcla?
- ¿El feed del dashboard muestra ambos orígenes (hoja y Relay) o solo las ediciones que vienen de la hoja? Los prototipos muestran ambos, con una etiqueta de origen.
- Agregar fila desde la plataforma: confirmar que las escrituras por la API no disparan el webhook de Apps Script (para no registrar las filas dos veces).
- Los permisos de administrador para el resto de acciones se deciden más adelante.
