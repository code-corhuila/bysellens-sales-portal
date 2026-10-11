import React from 'react';
import { IonIcon } from '@ionic/react';
import { addOutline } from 'ionicons/icons';
import './VentasBase.css';

interface Propiedades { abrirFormulario: () => void }
const EncabezadoVentas: React.FC<Propiedades> = ({ abrirFormulario }) => (
  <header className="ventas-header">
    <div>
      <span className="ventas-eyebrow">P?TALOS ADMIN</span>
      <h1>Ventas</h1>
      <p>Registra y consulta las ventas realizadas en tu tienda.</p>
    </div>
    <button className="ventas-new-button" onClick={abrirFormulario}>
      <IonIcon icon={addOutline} />Nueva venta
    </button>
  </header>
);
export default EncabezadoVentas;
