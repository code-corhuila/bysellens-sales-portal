import { leer, guardar, siguiente, fallo, buscar } from '@bysellens/frontend-core/mock';
import type { Venta, VentaRequest } from '@bysellens/frontend-core/modelos';
export const mockVentas = {
  listar: async () => leer().ventas,
  obtener: async (id: number) => buscar(leer().ventas, id),
  crear: async (solicitud: VentaRequest) => {
    const datos = leer();
    const cliente = buscar(datos.clientes, solicitud.clienteId);
    if (!cliente.activo || !solicitud.detalles.length) fallo('Cliente o detalles inválidos');
    const cantidades = new Map<number, number>();
    for (const detalle of solicitud.detalles) {
      if (!Number.isInteger(detalle.cantidad) || detalle.cantidad <= 0) fallo('Cantidad inválida');
      cantidades.set(detalle.productoId, (cantidades.get(detalle.productoId) || 0) + detalle.cantidad);
    }
    for (const [id, cantidad] of cantidades) {
      const producto = buscar(datos.productos, id);
      if (!producto.activo || producto.stock < cantidad) fallo('Stock insuficiente');
    }
    const detalles = solicitud.detalles.map((d, indice) => {
      const producto = buscar(datos.productos, d.productoId);
      return { id: indice + 1, cantidad: d.cantidad, precio: producto.precioVenta, subtotal: producto.precioVenta * d.cantidad, producto: { ...producto } };
    });
    for (const [id, cantidad] of cantidades) buscar(datos.productos, id).stock -= cantidad;
    const venta: Venta = { id: siguiente(datos.ventas), cliente: { ...cliente }, detalles, fecha: new Date().toISOString(), metodoPago: solicitud.metodoPago, total: detalles.reduce((total, d) => total + d.subtotal, 0) };
    datos.ventas.push(venta); guardar(datos); return venta;
  },
};
