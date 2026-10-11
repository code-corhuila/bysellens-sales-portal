import React, { useState } from 'react';
import { IonIcon } from '@ionic/react';
import { searchOutline, cubeOutline, receiptOutline, addOutline } from 'ionicons/icons';
import type { Venta } from '../../services/ventaService';
import './HistorialVentas.css';

interface Propiedades {
  ventas: Venta[];
  cargando: boolean;
  error: string;
  cargarDatos: () => void;
  abrirFormulario: () => void;
  formatoPrecio: (valor: number) => string;
}
const HistorialVentas: React.FC<Propiedades> = ({
  ventas, cargando, error, cargarDatos, abrirFormulario, formatoPrecio,
}) => {
  const [busqueda, setBusqueda] = useState('');
  const texto = busqueda.toLowerCase().trim();
  const ventasFiltradas = ventas.filter(venta => !texto ||
    String(venta.id).includes(texto) || venta.cliente.nombre.toLowerCase().includes(texto) ||
    venta.metodoPago.toLowerCase().includes(texto));
  return (
    <section className="ventas-card">
      <div className="ventas-card-header">
        <div>
          <h2>Registro de ventas</h2>
          <span>{ventas.length} {ventas.length === 1 ? 'venta registrada' : 'ventas registradas'}</span>
        </div>
        <button className="ventas-refresh-button" onClick={cargarDatos}>Actualizar</button>
      </div>
      <div className="ventas-search">
        <IonIcon icon={searchOutline} />
        <input value={busqueda} onChange={e => setBusqueda(e.target.value)}
          aria-label="Buscar ventas" placeholder="Buscar por cliente, m?todo de pago o ID..." />
      </div>
      {cargando && <div className="ventas-message">Cargando ventas...</div>}
      {!cargando && error && <div className="ventas-message ventas-error">{error}</div>}
      {!cargando && !error && ventasFiltradas.length > 0 && (
        <div className="ventas-table-wrapper">
          <table className="ventas-table">
            <thead><tr>
              <th>ID</th><th>Fecha</th><th>Cliente</th><th>Productos</th><th>Total</th><th>M?todo de pago</th>
            </tr></thead>
            <tbody>{ventasFiltradas.map(venta => (
              <tr key={venta.id}>
                <td><span className="venta-id">#{venta.id}</span></td>
                <td>{new Date(venta.fecha).toLocaleDateString('es-CO')}</td>
                <td><div className="venta-client-cell">
                  <div className="venta-avatar">{venta.cliente.nombre?.charAt(0).toUpperCase()}</div>
                  <strong>{venta.cliente.nombre}</strong>
                </div></td>
                <td><span className="venta-products-count">
                  <IonIcon icon={cubeOutline} />{venta.detalles.length} {venta.detalles.length === 1 ? 'producto' : 'productos'}
                </span></td>
                <td><strong className="venta-total">{formatoPrecio(venta.total)}</strong></td>
                <td><span className="venta-payment-badge">{venta.metodoPago}</span></td>
              </tr>
            ))}</tbody>
          </table>
        </div>
      )}
      {!cargando && !error && ventas.length === 0 && (
        <div className="ventas-empty">
          <div className="ventas-empty-icon"><IonIcon icon={receiptOutline} /></div>
          <strong>No hay ventas registradas</strong>
          <span>Registra tu primera venta para comenzar.</span>
          <button className="ventas-empty-button" onClick={abrirFormulario}>
            <IonIcon icon={addOutline} />Nueva venta
          </button>
        </div>
      )}
    </section>
  );
};
export default HistorialVentas;
