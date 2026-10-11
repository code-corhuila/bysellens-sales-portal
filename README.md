# By_Sellens — Sales Portal

Portal independiente de Ventas, React 19 + Ionic 9 + TypeScript + Vite.
Documentación del proyecto: [bysellens-docs](https://github.com/code-corhuila/bysellens-docs).

## Ejecutar

```sh
npm ci
npm run dev
npm run test.unit
npm run lint
npm run build
npm run test.e2e # portal activo en :5177
```

Portal: http://localhost:5177. Demo MOCK: admin@bysellens.com / demo123.
El modo predeterminado es MOCK y no necesita backend. Las ventas y existencias
simuladas se guardan en localStorage; la sesión se guarda en sessionStorage.
Para reiniciar la demostración, elimina la clave bysellens_mock_v1 de localStorage.

## Pantalla migrada

La ruta protegida /ventas reutiliza la pantalla de apps/sales/src/pages/Ventas.tsx,
extraída por responsabilidades, con sus textos, clases y estilos originales:

- EncabezadoVentas y ResumenVentas: cabecera y estadísticas del historial completo.
- HistorialVentas: tabla, búsqueda por cliente/método/ID, carga, error y actualización.
- CamposVenta: cliente, productos, cantidades, subtotales y cinco medios de pago.
- PanelVenta: panel lateral, total, errores y controles de registro y cierre.
- useVentas: carga, estado, validaciones, registro y recarga de stock.

Se preservan los adaptadores propios de Sales: ventaService, catalogoService y mock.
No se importan servicios internos de Customer, Inventory ni Product.
Se corrigieron los errores de contrato al leer mensaje/errores del backend y
se valida que las cantidades sean enteras antes de enviar el registro.
Si la venta se registra y solo falla la recarga de productos, se conserva el
historial y se registra una advertencia, como en el código original.

## Docker y configuración

```sh
docker build -t bysellens-sales-portal .
docker run --rm -p 5177:80 bysellens-sales-portal
```

Healthcheck: /health. Rutas: /login y /ventas. Recursos: /mfe/sales/.
VITE_DATA_MODE y VITE_API_BASE_URL están documentadas en .env.example.
Docker recibe DATA_MODE y API_BASE_URL al construir, no como configuración
dinámica del contenedor. No deben contener secretos.
El modo REAL se conserva, pero las pruebas de contrato usan transporte HTTP
simulado y no acreditan conexión con un backend real.

## Paquete compartido y pruebas

@bysellens/frontend-core@1.0.0 se consume desde vendor/bysellens-frontend-core-1.0.0.tgz,
idéntico al paquete original. El lockfile comprueba su integridad; npm ci no
depende de rutas externas. No se publica en npm ni se duplica su código en src.
React e Ionic mantienen las versiones del origen.

Vitest cubre servicios, contratos, sesión, componentes y lógica. Cypress cubre
sesión, rutas protegidas, registro, búsquedas, validaciones, stock y móvil.
En entornos con ELECTRON_RUN_AS_NODE, quitar esa variable solo del proceso
de Cypress permite que Electron arranque como navegador.
Avisos heredados: bundle principal mayor a 500 kB y 13 vulnerabilidades reportadas
durante la instalación Docker anterior (9 moderadas, 4 altas); no se actualizaron
dependencias durante la migración.

## Revisión y ramas

Ramas permanentes: develop, qa y main. Ninguna recibe commits directos.
Cada incremento se publica desde una rama hija mediante PR hacia develop.
Límite del curso: 400 líneas modificadas, excluyendo pruebas y archivos generados.
La promoción se hace por reaplicación (git cherry-pick -x), nunca fusionando ramas
permanentes entre sí. main requiere una aprobación de ariel5253.
No usar force push ni fusionar PR automáticamente.
HU oficial pendiente de identificar; las reglas consultadas no impiden abrir
el PR por ese motivo. No se inventan identificadores.
La documentación de cada extracción está en docs/incremento-*.md.
