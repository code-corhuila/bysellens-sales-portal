import { act, cleanup, renderHook, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, expect, it, vi } from 'vitest';
import { inicial } from '@bysellens/frontend-core/mock';
import { crearVenta, obtenerVentas } from '../services/ventaService';
import { obtenerClientes, obtenerProductos } from '../services/catalogoService';
import { useVentas } from './useVentas';
vi.mock('../services/ventaService');
vi.mock('../services/catalogoService');

beforeEach(() => {
  vi.resetAllMocks();
  const datos = inicial();
  vi.mocked(obtenerVentas).mockResolvedValue(datos.ventas);
  vi.mocked(obtenerClientes).mockResolvedValue(datos.clientes);
  vi.mocked(obtenerProductos).mockResolvedValue(datos.productos);
  vi.mocked(crearVenta).mockResolvedValue({ ...datos.ventas[0], id: 2, total: 36000 });
  vi.spyOn(console, 'error').mockImplementation(() => {});
  vi.spyOn(console, 'warn').mockImplementation(() => {});
});
afterEach(() => { cleanup(); vi.restoreAllMocks(); });
async function cargar() {
  const vista = renderHook(useVentas);
  await waitFor(() => expect(vista.result.current.cargando).toBe(false));
  return vista;
}
function preparar(vista: Awaited<ReturnType<typeof cargar>>) {
  act(() => {
    vista.result.current.abrirFormulario();
    vista.result.current.cambiarCliente(1);
    vista.result.current.cambiarProducto(0, 1);
  });
  act(() => vista.result.current.cambiarCantidad(0, 2));
}

it('carga los tres recursos y permite reintentar una carga fallida', async () => {
  vi.mocked(obtenerVentas).mockRejectedValueOnce(new Error('Sin conexi?n'));
  const vista = await cargar();
  expect(vista.result.current.error).toBe('No fue posible cargar la informaci?n de ventas.');
  await act(async () => { await vista.result.current.cargarDatos(); });
  expect(vista.result.current.error).toBe('');
  expect(vista.result.current.ventas).toHaveLength(1);
  expect(vista.result.current.clientes).toHaveLength(1);
  expect(vista.result.current.productos).toHaveLength(1);
});
it('reinicia el formulario y calcula el total y formato COP', async () => {
  const vista = await cargar();
  preparar(vista);
  expect(vista.result.current.totalVenta).toBe(36000);
  expect(vista.result.current.formatoPrecio(36000)).toMatch(/36\.000/);
  act(() => vista.result.current.cambiarMetodoPago('NEQUI'));
  act(() => vista.result.current.cerrarFormulario());
  act(() => vista.result.current.abrirFormulario());
  expect(vista.result.current).toMatchObject({
    clienteId: '', metodoPago: 'EFECTIVO', totalVenta: 0,
    detalles: [{ productoId: 0, cantidad: 1 }], mostrarFormulario: true,
  });
});
it('conserva el m?nimo y el l?mite de stock al cambiar cantidades', async () => {
  const vista = await cargar();
  preparar(vista);
  act(() => vista.result.current.cambiarCantidad(0, 99));
  expect(vista.result.current.detalles[0].cantidad).toBe(20);
  act(() => vista.result.current.cambiarCantidad(0, NaN));
  expect(vista.result.current.detalles[0].cantidad).toBe(1);
});
it('agrega y elimina l?neas manteniendo al menos una vac?a', async () => {
  const vista = await cargar();
  preparar(vista);
  act(() => vista.result.current.agregarProducto());
  expect(vista.result.current.detalles).toHaveLength(2);
  act(() => vista.result.current.eliminarProducto(0));
  expect(vista.result.current.detalles).toEqual([{ productoId: 0, cantidad: 1 }]);
  act(() => vista.result.current.eliminarProducto(0));
  expect(vista.result.current.detalles).toHaveLength(1);
});
it('valida cliente y al menos un producto antes de llamar al servicio', async () => {
  const vista = await cargar();
  await act(async () => { await vista.result.current.guardarVenta(); });
  expect(vista.result.current.mensajeFormulario).toContain('Selecciona un cliente');
  act(() => vista.result.current.cambiarCliente(1));
  await act(async () => { await vista.result.current.guardarVenta(); });
  expect(vista.result.current.mensajeFormulario).toContain('al menos un producto');
  expect(crearVenta).not.toHaveBeenCalled();
});
it('rechaza productos repetidos sin enviar la venta', async () => {
  const vista = await cargar();
  preparar(vista);
  act(() => vista.result.current.agregarProducto());
  act(() => vista.result.current.cambiarProducto(1, 1));
  await act(async () => { await vista.result.current.guardarVenta(); });
  expect(vista.result.current.mensajeFormulario).toContain('mismo producto dos veces');
  expect(crearVenta).not.toHaveBeenCalled();
});
it.each([
  { nombre: 'inexistente', producto: 999, cantidad: 2, mensaje: 'no existe' },
  { nombre: 'fraccionario', producto: 1, cantidad: 1.5, mensaje: 'entero' },
])('rechaza detalle $nombre', async ({ producto, cantidad, mensaje }) => {
  const vista = await cargar();
  preparar(vista);
  act(() => vista.result.current.cambiarProducto(0, producto));
  act(() => vista.result.current.cambiarCantidad(0, cantidad));
  await act(async () => { await vista.result.current.guardarVenta(); });
  expect(vista.result.current.mensajeFormulario).toContain(mensaje);
  expect(crearVenta).not.toHaveBeenCalled();
});
it('rechaza un producto inactivo', async () => {
  vi.mocked(obtenerProductos).mockResolvedValue([{ ...inicial().productos[0], activo: false }]);
  const vista = await cargar();
  preparar(vista);
  await act(async () => { await vista.result.current.guardarVenta(); });
  expect(vista.result.current.mensajeFormulario).toContain('inactivo');
  expect(crearVenta).not.toHaveBeenCalled();
});
it('valida el stock al cambiar a otro producto con menos existencias', async () => {
  const producto = inicial().productos[0];
  vi.mocked(obtenerProductos).mockResolvedValue([producto, { ...producto, id: 2, stock: 1 }]);
  const vista = await cargar();
  preparar(vista);
  act(() => vista.result.current.cambiarProducto(0, 2));
  await act(async () => { await vista.result.current.guardarVenta(); });
  expect(vista.result.current.mensajeFormulario).toContain('Stock insuficiente');
  expect(crearVenta).not.toHaveBeenCalled();
});
it('registra el contrato m?nimo, a?ade la venta y recarga el stock', async () => {
  const vista = await cargar();
  preparar(vista);
  act(() => vista.result.current.agregarProducto());
  vi.mocked(obtenerProductos).mockResolvedValue([{ ...inicial().productos[0], stock: 18 }]);
  await act(async () => { await vista.result.current.guardarVenta(); });
  expect(crearVenta).toHaveBeenCalledWith({
    clienteId: 1, metodoPago: 'EFECTIVO', detalles: [{ productoId: 1, cantidad: 2 }],
  });
  expect(vista.result.current.ventas.map(venta => venta.id)).toEqual([2, 1]);
  expect(vista.result.current.productos[0].stock).toBe(18);
  expect(vista.result.current.mostrarFormulario).toBe(false);
});
it('mantiene la venta registrada si falla la recarga de productos', async () => {
  const vista = await cargar();
  preparar(vista);
  vi.mocked(obtenerProductos).mockRejectedValueOnce(new Error('Sin conexi?n'));
  await act(async () => { await vista.result.current.guardarVenta(); });
  expect(vista.result.current.ventas).toHaveLength(2);
  expect(vista.result.current.mostrarFormulario).toBe(false);
  expect(console.warn).toHaveBeenCalled();
});
it.each([
  { datos: { mensaje: 'Stock actualizado' }, texto: 'Stock actualizado' },
  { datos: { errores: { cantidad: 'Cantidad inv?lida' } }, texto: 'Cantidad inv?lida' },
  { datos: { message: 'Error legado' }, texto: 'Error legado' },
  { datos: { error: 'Regla de negocio' }, texto: 'Regla de negocio' },
])('muestra los detalles del error $texto y conserva el formulario', async ({ datos, texto }) => {
  const vista = await cargar();
  preparar(vista);
  vi.mocked(crearVenta).mockRejectedValueOnce({ response: { data: datos } });
  await act(async () => { await vista.result.current.guardarVenta(); });
  expect(vista.result.current.mensajeFormulario).toBe(texto);
  expect(vista.result.current.mostrarFormulario).toBe(true);
  expect(vista.result.current.guardando).toBe(false);
  expect(vista.result.current.ventas).toHaveLength(1);
});
it('impide cerrar y reenviar mientras el registro est? pendiente', async () => {
  const vista = await cargar();
  preparar(vista);
  let resolver!: (venta: ReturnType<typeof inicial>['ventas'][number]) => void;
  vi.mocked(crearVenta).mockReturnValueOnce(new Promise(resolve => { resolver = resolve; }));
  let pendiente!: Promise<void>;
  act(() => { pendiente = vista.result.current.guardarVenta(); });
  expect(vista.result.current.guardando).toBe(true);
  act(() => vista.result.current.cerrarFormulario());
  await act(async () => { await vista.result.current.guardarVenta(); });
  expect(vista.result.current.mostrarFormulario).toBe(true);
  expect(crearVenta).toHaveBeenCalledTimes(1);
  await act(async () => { resolver({ ...inicial().ventas[0], id: 2 }); await pendiente; });
  expect(vista.result.current.guardando).toBe(false);
});
