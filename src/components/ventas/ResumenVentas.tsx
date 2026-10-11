import React from 'react';
import { IonIcon } from '@ionic/react';
import { receiptOutline, cardOutline, personOutline } from 'ionicons/icons';
import type { Venta } from '../../services/ventaService';
import './VentasBase.css';

interface Propiedades {
  ventas: Venta[];
  cantidadClientes: number;
  formatoPrecio: (valor: number) => string;
}
const ResumenVentas: React.FC<Propiedades> = ({ ventas, cantidadClientes, formatoPrecio }) => {
  const totalVendido = ventas.reduce((total, venta) => total + venta.total, 0);
  return (
    <div className="ventas-stats">
      <div className="venta-stat-card">
        <div className="venta-stat-icon"><IonIcon icon={receiptOutline} /></div>
        <div><span>Ventas registradas</span><strong>{ventas.length}</strong></div>
      </div>
      <div className="venta-stat-card">
        <div className="venta-stat-icon"><IonIcon icon={cardOutline} /></div>
        <div><span>Total vendido</span><strong>{formatoPrecio(totalVendido)}</strong></div>
      </div>
      <div className="venta-stat-card">
        <div className="venta-stat-icon"><IonIcon icon={personOutline} /></div>
        <div><span>Clientes</span><strong>{cantidadClientes}</strong></div>
      </div>
    </div>
  );
};
export default ResumenVentas;
