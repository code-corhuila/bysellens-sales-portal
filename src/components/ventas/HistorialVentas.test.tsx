import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, expect, it, vi } from 'vitest';
import { inicial } from '@bysellens/frontend-core/mock';
import HistorialVentas from './HistorialVentas';
afterEach(cleanup);
const venta = inicial().ventas[0];
const ventas = [venta, { ...venta, id: 25, cliente: { ...venta.cliente, nombre: 'Luisa Demo' }, metodoPago: 'NEQUI' }];
const propiedades = () => ({
  ventas, cargando: false, error: '', cargarDatos: vi.fn(), abrirFormulario: vi.fn(),
  formatoPrecio: (valor: number) => valor + ' COP',
});

it.each(['  luisa  ', 'NEQUI', '25'])('filtra por %s sin cambiar el contador original', texto => {
  render(<HistorialVentas {...propiedades()} />);
  fireEvent.change(screen.getByRole('textbox'), { target: { value: texto } });
  expect(screen.getByText('Luisa Demo')).toBeTruthy();
  expect(screen.queryByText('Ana Demo')).toBeNull();
  expect(screen.getByText('2 ventas registradas')).toBeTruthy();
});
it('limpia la búsqueda y vuelve a mostrar todos los registros', () => {
  render(<HistorialVentas {...propiedades()} />);
  fireEvent.change(screen.getByRole('textbox'), { target: { value: 'inexistente' } });
  expect(screen.queryByRole('table')).toBeNull();
  expect(screen.queryByText('No hay ventas registradas')).toBeNull();
  fireEvent.change(screen.getByRole('textbox'), { target: { value: '' } });
  expect(screen.getAllByRole('row')).toHaveLength(3);
  expect(screen.getAllByText('18000 COP')).toHaveLength(2);
});
it('prioriza carga y error frente al historial', () => {
  const props = propiedades();
  const vista = render(<HistorialVentas {...props} cargando error="Error de consulta" />);
  expect(screen.getByText('Cargando ventas...')).toBeTruthy();
  expect(screen.queryByRole('table')).toBeNull();
  expect(screen.queryByText('Error de consulta')).toBeNull();
  vista.rerender(<HistorialVentas {...props} error="Error de consulta" />);
  expect(screen.getByText('Error de consulta')).toBeTruthy();
  expect(screen.queryByRole('table')).toBeNull();
});
it('permite actualizar y abrir el formulario cuando no hay ventas', () => {
  const props = propiedades();
  render(<HistorialVentas {...props} ventas={[]} />);
  expect(screen.getByText('No hay ventas registradas')).toBeTruthy();
  fireEvent.click(screen.getByRole('button', { name: 'Actualizar' }));
  fireEvent.click(screen.getByRole('button', { name: 'Nueva venta' }));
  expect(props.cargarDatos).toHaveBeenCalledTimes(1);
  expect(props.abrirFormulario).toHaveBeenCalledTimes(1);
});
