import { beforeEach, expect, it } from 'vitest';
import { configurarFrontend } from '@bysellens/frontend-core/configuracion';
import { crearVenta } from './ventaService';
import { obtenerProductos } from './catalogoService';
beforeEach(() => { localStorage.clear(); configurarFrontend({ modo: 'mock', apiBase: '', portal: 'sales' }); });
it('registra una venta y descuenta existencias sin otros portales', async () => {
  const venta = await crearVenta({ clienteId: 1, metodoPago: 'EFECTIVO', detalles: [{ productoId: 1, cantidad: 2 }] });
  expect(venta.total).toBe(36000);
  expect((await obtenerProductos())[0].stock).toBe(18);
});
