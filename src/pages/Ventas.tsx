import React from 'react';
import { createPortal } from 'react-dom';
import { IonContent, IonPage } from '@ionic/react';
import EncabezadoVentas from '../components/ventas/EncabezadoVentas';
import ResumenVentas from '../components/ventas/ResumenVentas';
import HistorialVentas from '../components/ventas/HistorialVentas';
import CamposVenta from '../components/ventas/CamposVenta';
import PanelVenta from '../components/ventas/PanelVenta';
import { useVentas } from '../hooks/useVentas';

const Ventas: React.FC = () => {
  const ventas = useVentas();
  return (
    <IonPage>
      <IonContent>
        <div className="ventas-page">
          <EncabezadoVentas abrirFormulario={ventas.abrirFormulario} />
          <main className="ventas-content">
            <ResumenVentas ventas={ventas.ventas} cantidadClientes={ventas.clientes.length}
              formatoPrecio={ventas.formatoPrecio} />
            <HistorialVentas {...ventas} />
          </main>
          {createPortal(<div className="ventas-page" style={{ display: 'contents' }}>
          <PanelVenta mostrar={ventas.mostrarFormulario} guardando={ventas.guardando}
            mensaje={ventas.mensajeFormulario} total={ventas.formatoPrecio(ventas.totalVenta)}
            cerrarFormulario={ventas.cerrarFormulario} guardarVenta={ventas.guardarVenta}>
            <CamposVenta {...ventas} />
          </PanelVenta>
          </div>, document.body)}
        </div>
      </IonContent>
    </IonPage>
  );
};
export default Ventas;
