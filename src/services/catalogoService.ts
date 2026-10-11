import api from '@bysellens/frontend-core/api';
import { modoMock } from '@bysellens/frontend-core/configuracion';
import { leer } from '@bysellens/frontend-core/mock';
import type { Cliente, Producto } from '@bysellens/frontend-core/modelos';
export type { Cliente, Producto } from '@bysellens/frontend-core/modelos';
export const obtenerClientes = async (): Promise<Cliente[]> => modoMock ? leer().clientes : (await api.get<Cliente[]>('/api/clientes')).data;
export const obtenerProductos = async (): Promise<Producto[]> => modoMock ? leer().productos.filter(p => p.activo) : (await api.get<Producto[]>('/api/productos')).data;
