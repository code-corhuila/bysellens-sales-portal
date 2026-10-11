import { cleanup, fireEvent, render, screen, within } from '@testing-library/react';
import { afterEach, expect, it, vi } from 'vitest';
import { inicial } from '@bysellens/frontend-core/mock';
import CamposVenta from './CamposVenta';
afterEach(cleanup);
const propiedades = () => ({
  ...inicial(), clienteId: '' as number | '', metodoPago: 'EFECTIVO',
  detalles: [{ productoId: 1, cantidad: 2 }],
  cambiarCliente: vi.fn(), cambiarMetodoPago: vi.fn(), cambiarProducto: vi.fn(),
  cambiarCantidad: vi.fn(), agregarProducto: vi.fn(), eliminarProducto: vi.fn(),
  formatoPrecio: (valor: number) => valor + ' COP',
});
it('ofrece clientes activos y productos activos con existencias', () => {
  const props = propiedades();
  props.clientes.push({ ...props.clientes[0], id: 2, nombre: 'Inactivo', activo: false });
  props.productos.push({ ...props.productos[0], id: 2, nombre: 'Sin stock', stock: 0 });
  props.productos.push({ ...props.productos[0], id: 3, nombre: 'Inactivo', activo: false });
  render(<CamposVenta {...props} />);
  expect(within(screen.getByLabelText('Cliente *')).getAllByRole('option')).toHaveLength(2);
  expect(within(screen.getByLabelText('Producto')).getAllByRole('option')).toHaveLength(2);
  expect(screen.queryByRole('option', { name: 'Inactivo' })).toBeNull();
  expect(screen.getByText('36000 COP')).toBeTruthy();
  expect(screen.getByLabelText('Cant.').getAttribute('max')).toBe('20');
});
it('notifica selecciones, cantidades y operaciones de líneas', () => {
  const props = propiedades();
  render(<CamposVenta {...props} />);
  fireEvent.change(screen.getByLabelText('Cliente *'), { target: { value: '1' } });
  fireEvent.change(screen.getByLabelText('Producto'), { target: { value: '' } });
  fireEvent.change(screen.getByLabelText('Cant.'), { target: { value: '3' } });
  fireEvent.change(screen.getByLabelText('Forma de pago *'), { target: { value: 'NEQUI' } });
  fireEvent.click(screen.getByTitle('Eliminar producto'));
  fireEvent.click(screen.getByText('Agregar otro producto'));
  expect(props.cambiarCliente).toHaveBeenCalledWith(1);
  expect(props.cambiarProducto).toHaveBeenCalledWith(0, 0);
  expect(props.cambiarCantidad).toHaveBeenCalledWith(0, 3);
  expect(props.cambiarMetodoPago).toHaveBeenCalledWith('NEQUI');
  expect(props.eliminarProducto).toHaveBeenCalledWith(0);
  expect(props.agregarProducto).toHaveBeenCalledTimes(1);
});
it('conserva los cinco medios de pago y admite catálogos vacíos', () => {
  render(<CamposVenta {...propiedades()} clientes={[]} productos={[]} />);
  expect(within(screen.getByLabelText('Forma de pago *')).getAllByRole('option')).toHaveLength(5);
  expect(screen.getByText('0 COP')).toBeTruthy();
  expect(within(screen.getByLabelText('Producto')).getAllByRole('option')).toHaveLength(1);
});
