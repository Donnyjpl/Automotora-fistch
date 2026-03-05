import { useState, useEffect } from "react";
import { getAutos } from "../api/autoApi";
import { getVendedores } from "../api/vendedorApi";
import { getCompradores } from "../api/compradorApi";
import toast from "react-hot-toast";

const metodoPagoOpciones = ["efectivo", "credito", "transferencia"];

const initialState = {
  auto: "",
  vendedor: "",
  comprador: "",
  total: "",
  metodo_pago: "efectivo",
  numero_cuotas: 1,
  descuento: 0,
  comision_vendedor: 0,
};

const VentaForm = ({ onSubmit }) => {
  const [autos, setAutos] = useState([]);
  const [vendedores, setVendedores] = useState([]);
  const [compradores, setCompradores] = useState([]);
  const [formData, setFormData] = useState(initialState);
  const [precioBase, setPrecioBase] = useState(0);

  useEffect(() => { cargarDatos(); }, []);

  useEffect(() => {
    const descuento = parseFloat(formData.descuento) || 0;
    const total = Math.max(precioBase - descuento, 0);
    setFormData((prev) => ({ ...prev, total: total > 0 ? total : "" }));
  }, [precioBase, formData.descuento]);

  const cargarDatos = async () => {
    try {
      const [autosRes, vendedoresRes, compradoresRes] = await Promise.all([
        getAutos(),
        getVendedores(),
        getCompradores(),
      ]);
      setAutos(autosRes.data.filter((a) => a.estado === "disponible"));
      setVendedores(vendedoresRes.data);
      setCompradores(compradoresRes.data);
    } catch {
      toast.error("Error al cargar datos del formulario");
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === "auto") {
      const autoSeleccionado = autos.find((a) => a.id === parseInt(value));
      const precio = autoSeleccionado ? parseFloat(autoSeleccionado.precio) : 0;
      setPrecioBase(precio);
      setFormData((prev) => ({ ...prev, auto: value }));
      return;
    }
    setFormData((prev) => {
      const updated = { ...prev, [name]: value };
      if (name === "metodo_pago" && value === "efectivo") {
        updated.numero_cuotas = 1;
      }
      return updated;
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await onSubmit(formData);
      toast.success("Venta registrada correctamente");
      setFormData(initialState);
      setPrecioBase(0);
    } catch (error) {
      const msg = error?.response?.data
        ? Object.values(error.response.data).flat().join(" ")
        : "Error al guardar la venta";
      toast.error(msg);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white p-4 sm:p-6 rounded-2xl shadow mb-6">
      <h2 className="text-lg sm:text-xl font-bold text-gray-700 mb-4">🛒 Nueva Venta</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">

        <div>
          <label className="text-sm text-gray-500 mb-1 block">Auto</label>
          <select name="auto" value={formData.auto} onChange={handleChange} required
            className="border p-2 rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-indigo-400 text-sm">
            <option value="">Seleccionar Auto</option>
            {autos.map((a) => (
              <option key={a.id} value={a.id}>
                {a.marca} {a.modelo} ({a.año}) — S/ {parseFloat(a.precio).toLocaleString("es-PE")}
              </option>
            ))}
          </select>
          {precioBase > 0 && (
            <p className="text-xs text-indigo-500 mt-1">
              💰 Precio base: S/ {precioBase.toLocaleString("es-PE")}
            </p>
          )}
        </div>

        <div>
          <label className="text-sm text-gray-500 mb-1 block">Vendedor</label>
          <select name="vendedor" value={formData.vendedor} onChange={handleChange} required
            className="border p-2 rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-indigo-400 text-sm">
            <option value="">Seleccionar Vendedor</option>
            {vendedores.map((v) => (
              <option key={v.id} value={v.id}>{v.nombre}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="text-sm text-gray-500 mb-1 block">Comprador</label>
          <select name="comprador" value={formData.comprador} onChange={handleChange}
            className="border p-2 rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-indigo-400 text-sm">
            <option value="">Seleccionar Comprador (opcional)</option>
            {compradores.map((c) => (
              <option key={c.id} value={c.id}>{c.nombre} {c.apellido} — {c.dni_ruc}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="text-sm text-gray-500 mb-1 block">Descuento (S/)</label>
          <input name="descuento" type="number" min="0" value={formData.descuento} onChange={handleChange}
            placeholder="Ej: 500"
            className="border p-2 rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-indigo-400 text-sm" />
        </div>

        <div>
          <label className="text-sm text-gray-500 mb-1 block">
            Total (S/) <span className="text-indigo-400 text-xs">(automático)</span>
          </label>
          <input name="total" type="number" value={formData.total} readOnly
            className="border p-2 rounded-lg w-full bg-gray-50 text-indigo-600 font-bold cursor-not-allowed text-sm" />
        </div>

        <div>
          <label className="text-sm text-gray-500 mb-1 block">Comisión vendedor (S/)</label>
          <input name="comision_vendedor" type="number" min="0" value={formData.comision_vendedor} onChange={handleChange}
            placeholder="Ej: 200"
            className="border p-2 rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-indigo-400 text-sm" />
        </div>

        <div>
          <label className="text-sm text-gray-500 mb-1 block">Método de pago</label>
          <select name="metodo_pago" value={formData.metodo_pago} onChange={handleChange}
            className="border p-2 rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-indigo-400 text-sm">
            {metodoPagoOpciones.map((m) => (
              <option key={m} value={m}>{m.charAt(0).toUpperCase() + m.slice(1)}</option>
            ))}
          </select>
        </div>

        {formData.metodo_pago !== "efectivo" && (
          <div>
            <label className="text-sm text-gray-500 mb-1 block">Número de cuotas</label>
            <input name="numero_cuotas" type="number" min="2" value={formData.numero_cuotas} onChange={handleChange}
              placeholder="Ej: 12"
              className="border p-2 rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-indigo-400 text-sm" />
          </div>
        )}
      </div>

      {/* Resumen */}
      {precioBase > 0 && (
        <div className="mt-4 bg-indigo-50 rounded-xl p-3 sm:p-4 grid grid-cols-1 sm:flex sm:flex-wrap gap-3 sm:gap-4 text-sm">
          <div><span className="text-gray-400">Precio base:</span> <span className="font-semibold">S/ {precioBase.toLocaleString("es-PE")}</span></div>
          <div><span className="text-gray-400">Descuento:</span> <span className="font-semibold text-rose-500">- S/ {parseFloat(formData.descuento || 0).toLocaleString("es-PE")}</span></div>
          <div><span className="text-gray-400">Total a pagar:</span> <span className="font-extrabold text-indigo-600 text-base">S/ {parseFloat(formData.total || 0).toLocaleString("es-PE")}</span></div>
        </div>
      )}

      <button type="submit"
        className="mt-6 w-full sm:w-auto bg-indigo-500 hover:bg-indigo-600 text-white font-semibold px-6 py-2 rounded-lg transition text-sm">
        Registrar Venta
      </button>
    </form>
  );
};

export default VentaForm;