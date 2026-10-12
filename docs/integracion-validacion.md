# Validación de la integración de Sales Portal

La pantalla de /ventas compone los componentes extraídos del original; se retira
InicioVentas.tsx. El panel se monta con createPortal en document.body para evitar
que el contenedor de Ionic recorte los botones en móvil. Se mantienen sus estilos.
Se restauran los acentos que el transporte de texto de PowerShell había sustituido
en los incrementos anteriores. No se cambia el paquete compartido ni el original.

## Incrementos revisables

| PR | Rama | Commit de extracción | Líneas computables |
|---|---|---|---:|
| #3 | feat/sales-summary-components | 1c36213 | 223 |
| #4 | feat/sales-history-component | 372eff5 | 348 |
| #5 | feat/sales-form-fields | 9b4f327 | 308 |
| #6 | feat/sales-form-panel | 0243add | 271 |
| #7 | feat/sales-page-logic | 4b8b031 | 150 |

Cada rama partió de origin/develop y se publicó por PR; las cinco ya están
integradas en develop por revisión externa. No se fusionaron automáticamente.

## Evidencia de la versión integrada

- npm ci limpio: correcto; CYPRESS_INSTALL_BINARY=0, binario Cypress existente.
- Vitest: 63/63 pruebas en 9 archivos; ESLint y TypeScript/build correctos.
- Docker integration-review: construcción correcta, incluidas las 63 pruebas y build.
- Contenedor healthy; HTTP 200 en /health, /login, /ventas y /mfe/sales/ventas.
- Cypress completo: 6/6 (2 de sesión y 4 de ventas). Repetición final de ventas:
  4/4 con comprobación de ancho y capturas 1200x700 y 390x700.
- Navegador verifica registro, importes, búsqueda, persistencia, stock, validaciones,
  error del adaptador MOCK, panel móvil y ausencia de solicitudes al backend local.
- Capturas de escritorio/móvil inspeccionadas; permanecen en cypress/screenshots,
  ignoradas por Git, sin publicarlas como código.
- Comparación AST de CSS: 560 declaraciones idénticas al original, incluidos
  selectores, keyframes y media queries. Los archivos CSS cuentan para el límite.
- frontend-core 1.0.0 intacto, SHA-256:
  9f76cb4677fb2f9c037cc7b5b84fc9c834a76c26504bf7a1923066edf642ccdd.

La primera prueba integral detectó el recorte móvil y un gesto de teclado de
prueba que no cambiaba la cantidad; se corrigieron y las siguientes ejecuciones
pasaron. Los acentos también se verificaron en las capturas y los archivos UTF-8.
REAL conserva sus contratos, pero no se probó contra un backend.
Permanecen el aviso de bundle >500 kB y las vulnerabilidades heredadas documentadas.
HU oficial pendiente de identificar. No se requieren más pantallas nuevas para
completar esta migración; queda la revisión del PR de integración.
