import { useCallback, useEffect, useMemo, useState } from 'react';
import { crearVenta, obtenerVentas, type Venta } from '../services/ventaService';
import { obtenerClientes, obtenerProductos, type Cliente, type Producto } from '../services/catalogoService';

interface DetalleFormulario { productoId: number; cantidad: number }
const detalleInicial = (): DetalleFormulario[] => [{ productoId: 0, cantidad: 1 }];
const formatoPrecio = (valor: number) => new Intl.NumberFormat('es-CO', {
  style: 'currency', currency: 'COP', maximumFractionDigits: 0,
}).format(valor);

function mensajeError(error: unknown): string {
  const datos = (error as { response?: { data?: {
    mensaje?: string; message?: string; error?: string; errores?: Record<string, string>;
  } } })?.response?.data;
  return datos?.mensaje || (datos?.errores && Object.values(datos.errores).join(' ')) ||
    datos?.message || datos?.error || (error instanceof Error ? error.message : '') ||
    'No fue posible registrar la venta.';
}

export function useVentas() {
  const [ventas, setVentas] = useState<Venta[]>([]);
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [productos, setProductos] = useState<Producto[]>([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState('');
  const [mostrarFormulario, setMostrarFormulario] = useState(false);
  const [guardando, setGuardando] = useState(false);
  const [mensajeFormulario, setMensajeFormulario] = useState('');
  const [clienteId, cambiarCliente] = useState<number | ''>('');
  const [metodoPago, cambiarMetodoPago] = useState('EFECTIVO');
  const [detalles, setDetalles] = useState<DetalleFormulario[]>(detalleInicial);

  // ===== CARGA Y FORMULARIO =====
  const cargarDatos = useCallback(async () => {
    setCargando(true);
    setError('');
    try {
      const [ventasData, clientesData, productosData] = await Promise.all([
        obtenerVentas(), obtenerClientes(), obtenerProductos(),
      ]);
      setVentas(ventasData);
      setClientes(clientesData);
      setProductos(productosData);
    } catch (err) {
      console.error(err);
      setError('No fue posible cargar la informaci?n de ventas.');
    } finally { setCargando(false); }
  }, []);
  useEffect(() => { void cargarDatos(); }, [cargarDatos]);

  const abrirFormulario = () => {
    cambiarCliente('');
    cambiarMetodoPago('EFECTIVO');
    setDetalles(detalleInicial());
    setMensajeFormulario('');
    setMostrarFormulario(true);
  };
  const cerrarFormulario = () => {
    if (guardando) return;
    setMostrarFormulario(false);
    setMensajeFormulario('');
  };
  const cambiarProducto = (indice: number, productoId: number) => {
    setDetalles(actuales => actuales.map((detalle, posicion) =>
      posicion === indice ? { ...detalle, productoId } : detalle));
  };
  const cambiarCantidad = (indice: number, cantidad: number) => {
    const producto = productos.find(item => item.id === detalles[indice].productoId);
    let nuevaCantidad = Math.max(1, Number.isFinite(cantidad) ? cantidad : 1);
    if (producto && nuevaCantidad > producto.stock) nuevaCantidad = producto.stock;
    setDetalles(actuales => actuales.map((detalle, posicion) =>
      posicion === indice ? { ...detalle, cantidad: nuevaCantidad } : detalle));
  };
  const agregarProducto = () => setDetalles(actuales => [...actuales, ...detalleInicial()]);
  const eliminarProducto = (indice: number) => setDetalles(actuales =>
    actuales.length === 1 ? detalleInicial() : actuales.filter((_, posicion) => posicion !== indice));
  const totalVenta = useMemo(() => detalles.reduce((total, detalle) =>
    total + (productos.find(producto => producto.id === detalle.productoId)?.precioVenta || 0) *
    detalle.cantidad, 0), [detalles, productos]);

  // ===== VALIDACI?N Y REGISTRO =====
  const guardarVenta = async () => {
    if (guardando) return;
    setMensajeFormulario('');
    if (!clienteId) {
      setMensajeFormulario('Selecciona un cliente para continuar.');
      return;
    }
    const detallesValidos = detalles.filter(detalle => detalle.productoId > 0);
    if (!detallesValidos.length) {
      setMensajeFormulario('Agrega al menos un producto.');
      return;
    }
    if (new Set(detallesValidos.map(detalle => detalle.productoId)).size !== detallesValidos.length) {
      setMensajeFormulario('No puedes agregar el mismo producto dos veces.');
      return;
    }
    for (const detalle of detallesValidos) {
      const producto = productos.find(item => item.id === detalle.productoId);
      if (!producto) {
        setMensajeFormulario('Uno de los productos seleccionados no existe.');
        return;
      }
      if (!producto.activo) {
        setMensajeFormulario(`El producto "${producto.nombre}" est? inactivo.`);
        return;
      }
      if (!Number.isInteger(detalle.cantidad) || detalle.cantidad < 1) {
        setMensajeFormulario('La cantidad debe ser un entero mayor a 0.');
        return;
      }
      if (detalle.cantidad > producto.stock) {
        setMensajeFormulario(`Stock insuficiente para "${producto.nombre}". Disponible: ${producto.stock}.`);
        return;
      }
    }
    try {
      setGuardando(true);
      const nuevaVenta = await crearVenta({
        clienteId: Number(clienteId), metodoPago,
        detalles: detallesValidos.map(({ productoId, cantidad }) => ({ productoId, cantidad })),
      });
      setVentas(actuales => [nuevaVenta, ...actuales]);
      try { setProductos(await obtenerProductos()); }
      catch (err) { console.warn('No se pudieron actualizar los productos', err); }
      setMostrarFormulario(false);
      setMensajeFormulario('');
    } catch (err) {
      console.error('ERROR CREANDO VENTA:', err);
      setMensajeFormulario(mensajeError(err));
    } finally { setGuardando(false); }
  };

  return {
    ventas, clientes, productos, cargando, error, cargarDatos, mostrarFormulario,
    guardando, mensajeFormulario, clienteId, metodoPago, detalles, totalVenta, formatoPrecio,
    abrirFormulario, cerrarFormulario, cambiarCliente, cambiarMetodoPago,
    cambiarProducto, cambiarCantidad, agregarProducto, eliminarProducto, guardarVenta,
  };
}
