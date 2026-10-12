import { cleanup, fireEvent, render, screen, within } from '@testing-library/react';
import { afterEach, expect, it, vi } from 'vitest';
import { inicial } from '@bysellens/frontend-core/mock';
import EncabezadoVentas from './EncabezadoVentas';
import ResumenVentas from './ResumenVentas';
afterEach(cleanup);

it('conserva la cabecera original y solicita abrir el formulario', () => {
  const abrir = vi.fn();
  render(<EncabezadoVentas abrirFormulario={abrir} />);
  expect(screen.getByRole('heading', { name: 'Ventas' })).toBeTruthy();
  fireEvent.click(screen.getByRole('button', { name: 'Nueva venta' }));
  expect(abrir).toHaveBeenCalledTimes(1);
});
it('muestra cantidades y suma todos los importes del historial', () => {
  const venta = inicial().ventas[0];
  const formato = (valor: number) => valor + ' COP';
  render(<ResumenVentas ventas={[venta, { ...venta, id: 2, total: 36000 }]} cantidadClientes={3} formatoPrecio={formato} />);
  const tarjeta = screen.getByText('Total vendido').closest('.venta-stat-card')!;
  expect(within(tarjeta as HTMLElement).getByText('54000 COP')).toBeTruthy();
  expect(screen.getByText('2')).toBeTruthy();
  expect(screen.getByText('3')).toBeTruthy();
});
it('admite el catálogo y el historial vacíos', () => {
  render(<ResumenVentas ventas={[]} cantidadClientes={0} formatoPrecio={valor => valor + ' COP'} />);
  expect(screen.getByText('0 COP')).toBeTruthy();
  expect(screen.getAllByText('0')).toHaveLength(2);
});
