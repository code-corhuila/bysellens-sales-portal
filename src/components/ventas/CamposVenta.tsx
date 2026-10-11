import React from 'react';
import { IonIcon } from '@ionic/react';
import { personOutline, cubeOutline, cardOutline, trashOutline, addOutline } from 'ionicons/icons';
import type { Cliente, Producto } from '../../services/catalogoService';
import './CamposVenta.css';

interface Propiedades {
  clientes: Cliente[];
  productos: Producto[];
  clienteId: number | '';
  metodoPago: string;
  detalles: { productoId: number; cantidad: number }[];
  cambiarCliente: (id: number | '') => void;
  cambiarMetodoPago: (metodo: string) => void;
  cambiarProducto: (indice: number, id: number) => void;
  cambiarCantidad: (indice: number, cantidad: number) => void;
  agregarProducto: () => void;
  eliminarProducto: (indice: number) => void;
  formatoPrecio: (valor: number) => string;
}
const CamposVenta: React.FC<Propiedades> = ({
  clientes, productos, clienteId, metodoPago, detalles, cambiarCliente, cambiarMetodoPago,
  cambiarProducto, cambiarCantidad, agregarProducto, eliminarProducto, formatoPrecio,
}) => (
  <>
    <section className="venta-section">
      <div className="venta-section-title">
        <div className="venta-section-icon"><IonIcon icon={personOutline} /></div>
        <div><h3>Cliente</h3><p>Selecciona el cliente asociado a la venta.</p></div>
      </div>
      <div className="venta-field">
        <label htmlFor="venta-cliente">Cliente <span>*</span></label>
        <select id="venta-cliente" value={clienteId}
          onChange={e => cambiarCliente(e.target.value === '' ? '' : Number(e.target.value))}>
          <option value="">Seleccionar cliente</option>
          {clientes.filter(cliente => cliente.activo).map(cliente => (
            <option key={cliente.id} value={cliente.id}>{cliente.nombre}</option>
          ))}
        </select>
      </div>
    </section>
    <section className="venta-section">
      <div className="venta-section-title">
        <div className="venta-section-icon"><IonIcon icon={cubeOutline} /></div>
        <div><h3>Productos</h3><p>Agrega los productos incluidos en la venta.</p></div>
      </div>
      <div className="venta-products-list">
        {detalles.map((detalle, indice) => {
          const producto = productos.find(item => item.id === detalle.productoId);
          return (
            <div className="venta-product-row" key={indice}>
              <div className="venta-product-select">
                <label htmlFor={`venta-producto-${indice}`}>Producto</label>
                <select id={`venta-producto-${indice}`} value={detalle.productoId || ''}
                  onChange={e => cambiarProducto(indice, Number(e.target.value))}>
                  <option value="">Seleccionar producto</option>
                  {productos.filter(item => item.activo && item.stock > 0).map(item => (
                    <option key={item.id} value={item.id}>
                      {item.nombre}{' ? '}{formatoPrecio(item.precioVenta)}{' ? Stock: '}{item.stock}
                    </option>
                  ))}
                </select>
              </div>
              <div className="venta-quantity">
                <label htmlFor={`venta-cantidad-${indice}`}>Cant.</label>
                <input id={`venta-cantidad-${indice}`} type="number" min="1"
                  max={producto?.stock || undefined} value={detalle.cantidad}
                  onChange={e => cambiarCantidad(indice, Number(e.target.value))} />
              </div>
              <div className="venta-product-total">
                <span>Total</span><strong>{formatoPrecio((producto?.precioVenta || 0) * detalle.cantidad)}</strong>
              </div>
              <button type="button" className="venta-remove-product"
                onClick={() => eliminarProducto(indice)} title="Eliminar producto">
                <IonIcon icon={trashOutline} />
              </button>
            </div>
          );
        })}
      </div>
      <button type="button" className="venta-add-product" onClick={agregarProducto}>
        <IonIcon icon={addOutline} />Agregar otro producto
      </button>
    </section>
    <section className="venta-section">
      <div className="venta-section-title">
        <div className="venta-section-icon"><IonIcon icon={cardOutline} /></div>
        <div><h3>M?todo de pago</h3><p>Selecciona c?mo se realiz? el pago.</p></div>
      </div>
      <div className="venta-field">
        <label htmlFor="venta-pago">Forma de pago <span>*</span></label>
        <select id="venta-pago" value={metodoPago} onChange={e => cambiarMetodoPago(e.target.value)}>
          <option value="EFECTIVO">Efectivo</option>
          <option value="TARJETA">Tarjeta</option>
          <option value="TRANSFERENCIA">Transferencia</option>
          <option value="NEQUI">Nequi</option>
          <option value="DAVIPLATA">Daviplata</option>
        </select>
      </div>
    </section>
  </>
);
export default CamposVenta;
