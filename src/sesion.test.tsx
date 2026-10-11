import { act, cleanup, renderHook, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, expect, it, vi } from 'vitest';
import { AuthProvider, useAuth } from '@bysellens/frontend-core/auth/AuthContext';
import { configurarFrontend } from '@bysellens/frontend-core/configuracion';

beforeEach(() => {
  sessionStorage.clear();
  configurarFrontend({ modo: 'mock', apiBase: '', portal: 'sales' });
  vi.stubGlobal('fetch', vi.fn(() => { throw new Error('MOCK no debe usar backend'); }));
});
afterEach(() => { cleanup(); vi.unstubAllGlobals(); });

it('inicia sesión MOCK, la recupera después de remontar y la elimina al salir', async () => {
  const sesion = renderHook(() => useAuth(), { wrapper: AuthProvider });
  expect(sesion.result.current.autenticado).toBe(false);
  await act(async () => {
    await sesion.result.current.login({ email: 'admin@bysellens.com', password: 'demo123' });
  });
  expect(sesion.result.current.autenticado).toBe(true);
  expect(sessionStorage.getItem('bysellens_access_token')).toBe('mock-demo');
  sesion.unmount();
  const recuperada = renderHook(() => useAuth(), { wrapper: AuthProvider });
  await waitFor(() => expect(recuperada.result.current.autenticado).toBe(true));
  expect(recuperada.result.current.usuario?.email).toBe('admin@bysellens.com');
  act(() => recuperada.result.current.logout());
  expect(recuperada.result.current.autenticado).toBe(false);
  expect(sessionStorage.getItem('bysellens_access_token')).toBeNull();
  expect(sessionStorage.getItem('bysellens_usuario')).toBeNull();
  expect(fetch).not.toHaveBeenCalled();
});

it('rechaza credenciales MOCK incorrectas sin crear sesión', async () => {
  const { result } = renderHook(() => useAuth(), { wrapper: AuthProvider });
  await act(async () => {
    await expect(result.current.login({ email: 'admin@bysellens.com', password: 'incorrecta' })).rejects.toThrow();
  });
  expect(result.current.autenticado).toBe(false);
  expect(sessionStorage.getItem('bysellens_access_token')).toBeNull();
  expect(fetch).not.toHaveBeenCalled();
});
