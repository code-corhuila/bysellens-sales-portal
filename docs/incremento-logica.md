# Lógica de la página de Ventas
useVentas extrae el estado y las acciones de apps/sales/src/pages/Ventas.tsx.
Conserva carga paralela, apertura/reset, cierre, cambios de líneas, total COP,
validaciones, registro, incorporación al historial y recarga del catálogo de stock.
Consume únicamente los servicios de Sales existentes.
Se corrigen dos desajustes del original: los errores leen mensaje/errores del
contrato backend (además de message), y las cantidades fraccionarias se rechazan
antes de enviar la venta, igual que exige el adaptador MOCK.
El historial permanece registrado si falla su recarga posterior de productos,
como en el original. La composición visual es un incremento separado.
