# bysellens-sales-portal

> sales bounded context: web UI (remote)

Portal de Ventas de **By_Sellens**, sistema administrativo de una tienda de maquillaje.
Documentación del proyecto: [`bysellens-docs`](https://github.com/code-corhuila/bysellens-docs).

## Primer incremento

Reutiliza la configuración de `apps/sales/` y `@bysellens/frontend-core@1.0.0`.
Incluye login y sesión compartidos, React + Ionic, Vite y configuración Docker.
La entrada de Ventas es temporal: registro, historial, catálogos y stock MOCK
se incorporarán en incrementos posteriores conservando el código original.

```sh
npm ci
npm run dev
npm run test.unit
npm run lint
npm run build
npm run test.e2e # con el portal activo en :5177
```

Acceso: `http://localhost:5177`. Demo MOCK: `admin@bysellens.com` / `demo123`.
No necesita backend. `.env.example` documenta las variables; REAL requiere un
backend y no se considera validado con las pruebas MOCK.

```sh
docker build -t bysellens-sales-portal .
docker run --rm -p 5177:80 bysellens-sales-portal
```

Healthcheck: `/health`; rutas: `/login` y `/ventas`; recursos: `/mfe/sales/`.
`DATA_MODE` y `API_BASE_URL` son argumentos de construcción de Docker, no
configuración dinámica del contenedor. No deben contener secretos.

El archivo `vendor/bysellens-frontend-core-1.0.0.tgz` procede del portal original.
Se versiona para permitir `npm ci` sin rutas externas; el lockfile verifica su
integridad. No se publica en npm ni se duplica el código compartido en `src`.

Pendientes: adaptadores y pruebas de Ventas; migración funcional de las pantallas
y estilos originales en PR de máximo 400 líneas computables.
HU oficial pendiente de identificar; las reglas consultadas de develop no exigen
una HU para abrir el PR. No se asigna una HU inventada.

## Branching

Three permanent branches. **None of them accepts a direct commit** — you enter through a child
branch and leave through a Pull Request.

```
develop  <--PR--  feat/... fix/... chore/...
qa       <--PR--  qa/...
main     <--PR--  release/...  hotfix/...
```

Promotion happens **by re-application** (`git cherry-pick -x`), never by merging one permanent
branch into another: `merge develop -> qa` and `merge qa -> main` do not exist in this model.

`main` requires **1 approval from `ariel5253`**. On `develop` and `qa` the team sets its own review
rule.

Cada PR se dirige a `develop`, sin commits directos ni fusiones automáticas.
Límite del curso: 400 líneas modificadas, excluyendo pruebas y archivos generados.

## Validación del primer incremento

- `npm ci`, TypeScript, build y ESLint: correctos.
- Vitest: 2 pruebas de sesión correctas; Cypress: 2 pruebas correctas contra Docker.
- Docker: imagen construida, contenedor saludable y HTTP 200 en `/health`, `/`,
  `/login`, `/ventas`, `/mfe/sales/` y `/mfe/sales/ventas`.
- Cypress verifica login MOCK, recarga, cierre de sesión, rutas protegidas y errores,
  y falla si la aplicación solicita el backend local. REAL no se ha probado.
- En este entorno Windows se quitó `ELECTRON_RUN_AS_NODE` solo del proceso de
  Cypress para permitir el arranque de Electron; no se alteró la configuración global.
- React 19.0.0 e Ionic 9.0.1 deduplicados; integridad SHA-512 del paquete validada
  contra el lockfile y SHA-256 idéntico al archivo original de Sales.
- Avisos heredados: bundle principal superior a 500 kB y 13 vulnerabilidades
  reportadas por npm durante Docker (9 moderadas, 4 altas). No se actualizaron
  dependencias como parte de esta migración.

## Siguientes incrementos

1. Adaptadores propios: `ventaService.ts`, `catalogoService.ts`, `mock.ts` y pruebas
   de totales, cantidades, errores y descuento atómico de stock.
2. Extraer del original componentes funcionales con sus estilos: resumen e historial,
   selección de cliente, líneas de productos, pago y formulario. Cada incremento
   debe ser compilable y probado; mantener la entrada temporal hasta integrar la página.
3. Integrar la pantalla original y verificar búsquedas, registro y recarga de stock.

`Ventas.tsx` tiene 1501 líneas y `Ventas.css` 1726: no caben juntos en un PR.
La extracción se organizará por responsabilidades y sus pruebas, no por cortes de
líneas; cada PR debe medir como máximo 400 líneas computables antes de publicarse.
