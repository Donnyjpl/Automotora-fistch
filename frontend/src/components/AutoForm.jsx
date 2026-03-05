import { useState, useEffect } from "react";
import toast from "react-hot-toast";

const estadoOpciones = ["disponible", "reservado", "vendido"];
const combustibleOpciones = ["gasolina", "diesel", "electrico", "hibrido", "gas"];

const initialState = {
  marca: "",
  modelo: "",
  año: "",
  precio: "",
  estado: "disponible",
  color: "",
  kilometraje: "",
  combustible: "gasolina",
  vin: "",
};

const AutoForm = ({ onSubmit, autoSeleccionado }) => {
  const [formData, setFormData] = useState(initialState);

  useEffect(() => {
    if (autoSeleccionado) {
      setFormData({
        marca: autoSeleccionado.marca || "",
        modelo: autoSeleccionado.modelo || "",
        año: autoSeleccionado.año || "",
        precio: autoSeleccionado.precio || "",
        estado: autoSeleccionado.estado || "disponible",
        color: autoSeleccionado.color || "",
        kilometraje: autoSeleccionado.kilometraje || "",
        combustible: autoSeleccionado.combustible || "gasolina",
        vin: autoSeleccionado.vin || "",
      });
    } else {
      setFormData(initialState);
    }
  }, [autoSeleccionado]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await onSubmit(formData);
      toast.success(autoSeleccionado ? "Auto actualizado correctamente" : "Auto creado correctamente");
      setFormData(initialState);
    } catch (error) {
      const msg = error?.response?.data
        ? Object.values(error.response.data).flat().join(" ")
        : "Error al guardar el auto";
      toast.error(msg);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white p-4 sm:p-6 rounded-2xl shadow mb-6">
      <h2 className="text-lg sm:text-xl font-bold text-gray-700 mb-4">
        {autoSeleccionado ? "✏️ Editar Auto" : "🚗 Nuevo Auto"}
      </h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <div>
          <label className="text-sm text-gray-500 mb-1 block">Marca</label>
          <input name="marca" value={formData.marca} onChange={handleChange}
            placeholder="Ej: Toyota" required
            className="border p-2 rounded-lg w-full text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400" />
        </div>
        <div>
          <label className="text-sm text-gray-500 mb-1 block">Modelo</label>
          <input name="modelo" value={formData.modelo} onChange={handleChange}
            placeholder="Ej: Corolla" required
            className="border p-2 rounded-lg w-full text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400" />
        </div>
        <div>
          <label className="text-sm text-gray-500 mb-1 block">Año</label>
          <input name="año" type="number" value={formData.año} onChange={handleChange}
            placeholder="Ej: 2024" required
            className="border p-2 rounded-lg w-full text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400" />
        </div>
        <div>
          <label className="text-sm text-gray-500 mb-1 block">Precio (S/)</label>
          <input name="precio" type="number" value={formData.precio} onChange={handleChange}
            placeholder="Ej: 50000" required
            className="border p-2 rounded-lg w-full text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400" />
        </div>
        <div>
          <label className="text-sm text-gray-500 mb-1 block">Color</label>
          <input name="color" value={formData.color} onChange={handleChange}
            placeholder="Ej: Rojo"
            className="border p-2 rounded-lg w-full text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400" />
        </div>
        <div>
          <label className="text-sm text-gray-500 mb-1 block">Kilometraje (km)</label>
          <input name="kilometraje" type="number" value={formData.kilometraje} onChange={handleChange}
            placeholder="Ej: 0"
            className="border p-2 rounded-lg w-full text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400" />
        </div>
        <div>
          <label className="text-sm text-gray-500 mb-1 block">VIN / Placa</label>
          <input name="vin" value={formData.vin} onChange={handleChange}
            placeholder="Ej: ABC-123"
            className="border p-2 rounded-lg w-full text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400" />
        </div>
        <div>
          <label className="text-sm text-gray-500 mb-1 block">Combustible</label>
          <select name="combustible" value={formData.combustible} onChange={handleChange}
            className="border p-2 rounded-lg w-full text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400">
            {combustibleOpciones.map((c) => (
              <option key={c} value={c}>{c.charAt(0).toUpperCase() + c.slice(1)}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="text-sm text-gray-500 mb-1 block">Estado</label>
          <select name="estado" value={formData.estado} onChange={handleChange}
            className="border p-2 rounded-lg w-full text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400">
            {estadoOpciones.map((e) => (
              <option key={e} value={e}>{e.charAt(0).toUpperCase() + e.slice(1)}</option>
            ))}
          </select>
        </div>
      </div>
      <button type="submit"
        className="mt-6 w-full sm:w-auto bg-indigo-500 hover:bg-indigo-600 text-white font-semibold px-6 py-2 rounded-lg transition text-sm">
        {autoSeleccionado ? "Actualizar Auto" : "Crear Auto"}
      </button>
    </form>
  );
};

export default AutoForm;