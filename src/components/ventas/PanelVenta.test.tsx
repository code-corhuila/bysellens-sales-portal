import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, expect, it, vi } from 'vitest';
import PanelVenta from './PanelVenta';
afterEach(cleanup);
const propiedades = () => ({
  mostrar: true, guardando: false, mensaje: '', total: '$ 36.000',
  cerrarFormulario: vi.fn(), guardarVenta: vi.fn(), children: <div>Campos de la venta</div>,
});
it('oculta el panel cuando no se ha solicitado una venta', () => {
  render(<PanelVenta {...propiedades()} mostrar={false} />);
  expect(screen.queryByRole('dialog')).toBeNull();
});
it('muestra los campos, el importe y los errores originales', () => {
  render(<PanelVenta {...propiedades()} mensaje="Stock insuficiente" />);
  expect(screen.getByRole('dialog', { name: 'Nueva venta' })).toBeTruthy();
  expect(screen.getByText('Campos de la venta')).toBeTruthy();
  expect(screen.getByText('$ 36.000')).toBeTruthy();
  expect(screen.getByRole('alert').textContent).toBe('Stock insuficiente');
});
it('notifica registro y todas las formas de cierre', () => {
  const props = propiedades();
  render(<PanelVenta {...props} />);
  fireEvent.click(screen.getByRole('button', { name: 'Registrar venta' }));
  fireEvent.click(screen.getByRole('button', { name: 'Cancelar' }));
  fireEvent.click(screen.getByRole('button', { name: 'Cerrar formulario' }));
  fireEvent.click(screen.getByRole('button', { name: 'Cerrar' }));
  expect(props.guardarVenta).toHaveBeenCalledTimes(1);
  expect(props.cerrarFormulario).toHaveBeenCalledTimes(3);
});
it('bloquea registro repetido y cierre mientras se guarda', () => {
  const props = propiedades();
  render(<PanelVenta {...props} guardando />);
  expect(screen.getByRole('button', { name: 'Registrando...' }).hasAttribute('disabled')).toBe(true);
  for (const boton of screen.getAllByRole('button')) fireEvent.click(boton);
  expect(props.guardarVenta).not.toHaveBeenCalled();
  expect(props.cerrarFormulario).not.toHaveBeenCalled();
});
