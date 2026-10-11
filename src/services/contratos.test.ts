import { afterEach, beforeEach, expect, it, vi } from 'vitest';
import { AxiosError, AxiosHeaders, type InternalAxiosRequestConfig } from 'axios';
import api from '@bysellens/frontend-core/api';
import { configurarFrontend } from '@bysellens/frontend-core/configuracion';
import { inicial } from '@bysellens/frontend-core/mock';
import { crearVenta, obtenerVentaPorId, obtenerVentas } from './ventaService';
import { obtenerClientes, obtenerProductos } from './catalogoService';

const adaptadorOriginal = api.defaults.adapter;
const transporte = vi.fn(async (config: InternalAxiosRequestConfig) => ({
  data: {}, status: 200, statusText: 'OK', headers: new AxiosHeaders(), config,
}));

beforeEach(() => {
  localStorage.clear();
  sessionStorage.clear();
  configurarFrontend({ modo: 'real', apiBase: 'https://api.example.test', portal: 'sales' });
  sessionStorage.setItem('bysellens_access_token', 'token-sintetico');
  transporte.mockClear();
  api.defaults.adapter = transporte;
});
afterEach(() => {
  api.defaults.adapter = adaptadorOriginal;
  configurarFrontend({ modo: 'mock', apiBase: '', portal: 'sales' });
  sessionStorage.clear();
});

it.each([
  { nombre: 'ventas', consultar: obtenerVentas, ruta: '/api/ventas', datos: inicial().ventas },
  { nombre: 'venta por ID', consultar: () => obtenerVentaPorId(1), ruta: '/api/ventas/1', datos: inicial().ventas[0] },
  { nombre: 'clientes', consultar: obtenerClientes, ruta: '/api/clientes', datos: inicial().clientes },
  { nombre: 'productos', consultar: obtenerProductos, ruta: '/api/productos', datos: inicial().productos },
])('respeta el contrato HTTP de $nombre sin usar el almacenamiento MOCK', async ({ consultar, ruta, datos }) => {
  transporte.mockImplementationOnce(async config => ({ data: datos, status: 200, statusText: 'OK', headers: new AxiosHeaders(), config }));
  expect(await consultar()).toEqual(datos);
  expect(transporte).toHaveBeenCalledTimes(1);
  const config = transporte.mock.calls[0][0];
  expect(config).toMatchObject({ method: 'get', url: ruta, baseURL: 'https://api.example.test' });
  expect(config.headers.get('Authorization')).toBe('Bearer token-sintetico');
  expect(localStorage.length).toBe(0);
});

it('envía solamente el contrato de registro y devuelve los precios calculados por el servidor', async () => {
  const entrada = { clienteId: 1, metodoPago: 'EFECTIVO', detalles: [{ productoId: 1, cantidad: 2 }] };
  const respuesta = { ...inicial().ventas[0], id: 15, total: 36000 };
  transporte.mockImplementationOnce(async config => ({ data: respuesta, status: 200, statusText: 'OK', headers: new AxiosHeaders(), config }));
  expect(await crearVenta(entrada)).toEqual(respuesta);
  const config = transporte.mock.calls[0][0];
  expect(config).toMatchObject({ method: 'post', url: '/api/ventas' });
  expect(JSON.parse(config.data)).toEqual(entrada);
  expect(localStorage.length).toBe(0);
});

it.each([
  { estado: 400, datos: { error: 'Validación', errores: { cantidad: 'Debe ser positiva' } } },
  { estado: 409, datos: { error: 'Conflicto', mensaje: 'Stock insuficiente' } },
])('propaga el error HTTP $estado conservando los detalles del backend', async ({ estado, datos }) => {
  transporte.mockImplementationOnce(async config => {
    throw new AxiosError('Solicitud rechazada', 'ERR_BAD_REQUEST', config, undefined, {
      data: datos, status: estado, statusText: 'Error', headers: new AxiosHeaders(), config,
    });
  });
  await expect(crearVenta({ clienteId: 1, metodoPago: 'EFECTIVO', detalles: [{ productoId: 1, cantidad: 2 }] }))
    .rejects.toMatchObject({ response: { status: estado, data: datos } });
  expect(localStorage.length).toBe(0);
});

it('propaga errores de red sin recurrir al catálogo MOCK', async () => {
  transporte.mockRejectedValueOnce(new AxiosError('Sin conexión', 'ERR_NETWORK'));
  await expect(obtenerProductos()).rejects.toMatchObject({ code: 'ERR_NETWORK' });
  expect(localStorage.length).toBe(0);
});
