# Cabecera y resumen de Ventas
Extracción funcional de la cabecera y las tres estadísticas de la pantalla original
apps/sales/src/pages/Ventas.tsx. Se preservan textos, clases, iconos y cálculos.
VentasBase.css conserva las reglas base, cabecera, estadísticas y sus media queries;
solo se normaliza el formato y se retiran separadores y líneas vacías.
Los componentes reciben datos y acciones; no solicitan servicios por su cuenta.
La integración en la ruta /ventas llegará tras revisar los componentes independientes.
