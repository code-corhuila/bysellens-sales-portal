# L?gica de la p?gina de Ventas
useVentas extrae el estado y las acciones de apps/sales/src/pages/Ventas.tsx.
Conserva carga paralela, apertura/reset, cierre, cambios de l?neas, total COP,
validaciones, registro, incorporaci?n al historial y recarga del cat?logo de stock.
Consume ?nicamente los servicios de Sales existentes.
Se corrigen dos desajustes del original: los errores leen mensaje/errores del
contrato backend (adem?s de message), y las cantidades fraccionarias se rechazan
antes de enviar la venta, igual que exige el adaptador MOCK.
El historial permanece registrado si falla su recarga posterior de productos,
como en el original. La composici?n visual es un incremento separado.
