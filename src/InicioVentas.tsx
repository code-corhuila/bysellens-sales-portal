import { IonContent, IonPage } from '@ionic/react';

// Entrada temporal del primer incremento; no sustituye la pantalla original.
export default function InicioVentas() {
  return (
    <IonPage>
      <IonContent className="ion-padding">
        <h1>Ventas</h1>
        <p>El registro y el historial de ventas aún no están disponibles.</p>
      </IonContent>
    </IonPage>
  );
}
