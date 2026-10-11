import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import api from '@bysellens/frontend-core/api';
import { configurarFrontend } from '@bysellens/frontend-core/configuracion';
import { guardar, leer } from '@bysellens/frontend-core/mock';
import type { VentaRequest } from './ventaService';
import { crearVenta, obtenerVentaPorId, obtenerVentas } from './ventaService';
import { obtenerClientes, obtenerProductos } from './catalogoService';

const solicitud = (cantidad = 2): VentaRequest => ({
  clienteId: 1, metodoPago: 'EFECTIVO', detalles: [{ productoId: 1, cantidad }],
});

beforeEach(() => {
  localStorage.clear();
  sessionStorage.clear();
  configurarFrontend({ modo: 'mock', apiBase: '', portal: 'sales' });
  vi.spyOn(api, 'get').mockRejectedValue(new Error('MOCK no debe usar HTTP'));
  vi.spyOn(api, 'post').mockRejectedValue(new Error('MOCK no debe usar HTTP'));
});
afterEach(() => {
  expect(api.get).not.toHaveBeenCalled();
  expect(api.post).not.toHaveBeenCalled();
  vi.restoreAllMocks();
});

describe('Catálogos e historial MOCK', () => {
  it('consulta los datos sintéticos y recupera una venta por ID', async () => {
    expect((await obtenerClientes())[0].email).toBe('ana@example.com');
    expect((await obtenerProductos())[0].stock).toBe(20);
    expect(await obtenerVentas()).toHaveLength(1);
    expect((await obtenerVentaPorId(1)).total).toBe(18000);
    await expect(obtenerVentaPorId(999)).rejects.toThrow('Registro no encontrado');
  });

  it('filtra productos inactivos y conserva el contrato de clientes sin filtrar', async () => {
    const datos = leer();
    datos.productos.push({ ...datos.productos[0], id: 2, activo: false });
    datos.clientes.push({ ...datos.clientes[0], id: 2, activo: false });
    guardar(datos);
    expect((await obtenerProductos()).map(producto => producto.id)).toEqual([1]);
    expect((await obtenerClientes()).map(cliente => cliente.id)).toEqual([1, 2]);
  });
});

describe('Registro y existencias MOCK', () => {
  it('calcula importes de varios productos, persiste y conserva las instantáneas históricas', async () => {
    const datos = leer();
    datos.productos.push({ ...datos.productos[0], id: 2, precioVenta: 25000, stock: 5 });
    guardar(datos);
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-10-10T15:00:00.000Z'));
    try {
      const venta = await crearVenta({ ...solicitud(), metodoPago: 'TARJETA', detalles: [
        { productoId: 1, cantidad: 2 }, { productoId: 2, cantidad: 3 },
      ] });
      expect(venta).toMatchObject({ id: 2, total: 111000, metodoPago: 'TARJETA', fecha: '2026-10-10T15:00:00.000Z' });
      expect(venta.detalles.map(detalle => [detalle.precio, detalle.subtotal])).toEqual([[18000, 36000], [25000, 75000]]);
      expect((await obtenerProductos()).map(producto => producto.stock)).toEqual([18, 2]);
      expect(await obtenerVentaPorId(2)).toEqual(venta);
      expect(await obtenerVentas()).toHaveLength(2);
      const actualizados = leer();
      actualizados.productos[0].precioVenta = 99999;
      actualizados.clientes[0].nombre = 'Nombre demo actualizado';
      guardar(actualizados);
      expect((await obtenerVentaPorId(2)).detalles[0].precio).toBe(18000);
      expect((await obtenerVentaPorId(2)).cliente.nombre).toBe('Ana Demo');
    } finally { vi.useRealTimers(); }
  });

  it('acumula líneas repetidas para validar y descontar stock una sola vez', async () => {
    const venta = await crearVenta({ ...solicitud(), detalles: [
      { productoId: 1, cantidad: 2 }, { productoId: 1, cantidad: 3 },
    ] });
    expect(venta.total).toBe(90000);
    expect(venta.detalles).toHaveLength(2);
    expect((await obtenerProductos())[0].stock).toBe(15);
  });

  it('permite agotar existencias y rechaza la venta siguiente sin alterar el historial', async () => {
    await crearVenta(solicitud(20));
    expect((await obtenerProductos())[0].stock).toBe(0);
    const anterior = leer();
    await expect(crearVenta(solicitud(1))).rejects.toThrow('Stock insuficiente');
    expect(leer()).toEqual(anterior);
  });

  it('genera IDs consecutivos y conserva el stock entre registros', async () => {
    expect((await crearVenta(solicitud(1))).id).toBe(2);
    expect((await crearVenta(solicitud(1))).id).toBe(3);
    expect((await obtenerProductos())[0].stock).toBe(18);
  });

  it.each([0, -1, 1.5, NaN, Infinity])('rechaza cantidad inválida %s sin cambios', async cantidad => {
    const anterior = leer();
    await expect(crearVenta(solicitud(cantidad))).rejects.toMatchObject({
      response: { data: { error: 'Cantidad inválida', mensaje: 'Cantidad inválida' } },
    });
    expect(leer()).toEqual(anterior);
  });

  it.each([
    { nombre: 'cliente inexistente', entrada: { ...solicitud(), clienteId: 999 }, error: 'Registro no encontrado' },
    { nombre: 'detalles vacíos', entrada: { ...solicitud(), detalles: [] }, error: 'Cliente o detalles inválidos' },
    { nombre: 'producto inexistente', entrada: { ...solicitud(), detalles: [{ productoId: 999, cantidad: 1 }] }, error: 'Registro no encontrado' },
    { nombre: 'stock insuficiente', entrada: solicitud(21), error: 'Stock insuficiente' },
    { nombre: 'suma repetida supera stock', entrada: { ...solicitud(), detalles: [{ productoId: 1, cantidad: 11 }, { productoId: 1, cantidad: 10 }] }, error: 'Stock insuficiente' },
  ])('rechaza $nombre sin persistir una venta ni modificar stock', async ({ entrada, error }) => {
    const anterior = leer();
    await expect(crearVenta(entrada)).rejects.toThrow(error);
    expect(leer()).toEqual(anterior);
  });

  it.each(['clientes', 'productos'] as const)('rechaza registros inactivos de %s', async recurso => {
    const datos = leer();
    datos[recurso][0].activo = false;
    guardar(datos);
    await expect(crearVenta(solicitud())).rejects.toThrow();
    expect(leer()).toEqual(datos);
  });

  it('valida todos los productos antes de descontar cualquiera', async () => {
    const datos = leer();
    datos.productos.push({ ...datos.productos[0], id: 2, stock: 0 });
    guardar(datos);
    await expect(crearVenta({ ...solicitud(), detalles: [
      { productoId: 1, cantidad: 2 }, { productoId: 2, cantidad: 1 },
    ] })).rejects.toThrow('Stock insuficiente');
    expect(leer()).toEqual(datos);
  });
});
