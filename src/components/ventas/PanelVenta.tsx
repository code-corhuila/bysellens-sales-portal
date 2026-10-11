import React from 'react';
import { IonIcon } from '@ionic/react';
import { closeOutline, receiptOutline } from 'ionicons/icons';
import './PanelVenta.css';

interface Propiedades {
  mostrar: boolean;
  guardando: boolean;
  mensaje: string;
  total: string;
  cerrarFormulario: () => void;
  guardarVenta: () => void;
  children: React.ReactNode;
}
const PanelVenta: React.FC<Propiedades> = ({
  mostrar, guardando, mensaje, total, cerrarFormulario, guardarVenta, children,
}) => {
  if (!mostrar) return null;
  const cerrar = () => { if (!guardando) cerrarFormulario(); };
  return (
    <div className="venta-modal-overlay">
      <button className="venta-modal-backdrop" onClick={cerrar} aria-label="Cerrar" disabled={guardando} />
      <aside className="venta-modal-panel" role="dialog" aria-modal="true" aria-labelledby="titulo-nueva-venta">
        <div className="venta-form-header">
          <div>
            <span className="venta-form-eyebrow">P?TALOS ADMIN</span>
            <h2 id="titulo-nueva-venta">Nueva venta</h2>
            <p>Registra los productos vendidos y el m?todo de pago.</p>
          </div>
          <button className="venta-close-button" onClick={cerrar} disabled={guardando} aria-label="Cerrar formulario">
            <IonIcon icon={closeOutline} />
          </button>
        </div>
        <div className="venta-form-content">
          {children}
          <div className="venta-summary"><span>Total de la venta</span><strong>{total}</strong></div>
          {mensaje && <div className="venta-form-error" role="alert">{mensaje}</div>}
        </div>
        <div className="venta-form-footer">
          <button type="button" className="venta-button venta-button-secondary" onClick={cerrar} disabled={guardando}>
            Cancelar
          </button>
          <button type="button" className="venta-button venta-button-primary" onClick={guardarVenta} disabled={guardando}>
            <IonIcon icon={receiptOutline} />{guardando ? 'Registrando...' : 'Registrar venta'}
          </button>
        </div>
      </aside>
    </div>
  );
};
export default PanelVenta;
