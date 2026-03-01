import { useState, useEffect } from "react";
import toast from "react-hot-toast";

const initialState = {
  nombre: "",
  apellido: "",
  dni_ruc: "",
  telefono: "",
  direccion: "",
};

const CompradorForm = ({ onSubmit, compradorSeleccionado }) => {
  const [formData, setFormData] = useState(initialState);

  useEffect(() => {
    if (compradorSeleccionado) {
      setFormData({
        nombre: compradorSeleccionado.nombre || "",
        apellido: compradorSeleccionado.apellido || "",
        dni_ruc: compradorSeleccionado.dni_ruc || "",
        telefono: compradorSeleccionado.telefono || "",
        direccion: compradorSeleccionado.direccion || "",
      });
    } else {
      setFormData(initialState);
    }
  }, [compradorSeleccionado]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await onSubmit(formData);
      toast.success(compradorSeleccionado ? "Comprador actualizado correctamente" : "Comprador registrado correctamente");
      setFormData(initialState);
    } catch (error) {
      const msg = error?.response?.data
        ? Object.values(error.response.data).flat().join(" ")
        : "Error al guardar el comprador";
      toast.error(msg);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white p-6 rounded-2xl shadow mb-6">
      <h2 className="text-xl font-bold text-gray-700 mb-4">
        {compradorSeleccionado ? "✏️ Editar Comprador" : "👤 Nuevo Comprador"}
      </h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <div>
          <label className="text-sm text-gray-500 mb-1 block">Nombre</label>
          <input name="nombre" value={formData.nombre} onChange={handleChange}
            placeholder="Ej: Juan" required
            className="border p-2 rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-indigo-400" />
        </div>
        <div>
          <label className="text-sm text-gray-500 mb-1 block">Apellido</label>
          <input name="apellido" value={formData.apellido} onChange={handleChange}
            placeholder="Ej: Pérez" required
            className="border p-2 rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-indigo-400" />
        </div>
        <div>
          <label className="text-sm text-gray-500 mb-1 block">DNI / RUC</label>
          <input name="dni_ruc" value={formData.dni_ruc} onChange={handleChange}
            placeholder="8 dígitos DNI o 11 RUC" required
            className="border p-2 rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-indigo-400" />
        </div>
        <div>
          <label className="text-sm text-gray-500 mb-1 block">Teléfono</label>
          <input name="telefono" value={formData.telefono} onChange={handleChange}
            placeholder="Ej: 987654321" required
            className="border p-2 rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-indigo-400" />
        </div>
        <div className="sm:col-span-2">
          <label className="text-sm text-gray-500 mb-1 block">Dirección</label>
          <input name="direccion" value={formData.direccion} onChange={handleChange}
            placeholder="Ej: Av. Larco 123, Miraflores" required
            className="border p-2 rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-indigo-400" />
        </div>
      </div>
      <button type="submit"
        className="mt-6 bg-indigo-500 hover:bg-indigo-600 text-white font-semibold px-6 py-2 rounded-lg transition">
        {compradorSeleccionado ? "Actualizar Comprador" : "Registrar Comprador"}
      </button>
    </form>
  );
};

export default CompradorForm;