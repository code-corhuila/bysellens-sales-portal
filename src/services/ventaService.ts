import type { Venta, VentaRequest } from '@bysellens/frontend-core/modelos';
export type { Venta, VentaRequest } from '@bysellens/frontend-core/modelos';
import { modoMock } from '@bysellens/frontend-core/configuracion';
import { mockVentas } from './mock';
import api from '@bysellens/frontend-core/api';

const API_URL = '/api/ventas';

// =========================
// DETALLE DE VENTA
// =========================



// =========================
// CREAR VENTA
// =========================



// =========================
// PRODUCTO
// =========================



// =========================
// CLIENTE
// =========================



// =========================
// DETALLE DEVUELTO
// =========================



// =========================
// VENTA DEVUELTA
// =========================



// =========================
// LISTAR VENTAS
// =========================

export const obtenerVentas = async (): Promise<Venta[]> => {
  if (modoMock) return mockVentas.listar();
  const response = await api.get<Venta[]>(API_URL);

  return response.data;
};

// =========================
// BUSCAR VENTA
// =========================

export const obtenerVentaPorId = async (
  id: number
): Promise<Venta> => {
  if (modoMock) return mockVentas.obtener(id);
  const response = await api.get<Venta>(
    `${API_URL}/${id}`
  );

  return response.data;
};

// =========================
// CREAR VENTA
// =========================

export const crearVenta = async (
  venta: VentaRequest
): Promise<Venta> => {
  if (modoMock) return mockVentas.crear(venta);
  const response = await api.post<Venta>(
    API_URL,
    venta
  );

  return response.data;
};