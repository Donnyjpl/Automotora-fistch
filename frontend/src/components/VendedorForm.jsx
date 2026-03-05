import { useState, useEffect } from "react";
import toast from "react-hot-toast";

const VendedorForm = ({ onSubmit, vendedorSeleccionado }) => {
  const [formData, setFormData] = useState({
    nombre: "",
    email: "",
    telefono: "",
  });

  useEffect(() => {
    if (vendedorSeleccionado) {
      setFormData(vendedorSeleccionado);
    } else {
      setFormData({ nombre: "", email: "", telefono: "" });
    }
  }, [vendedorSeleccionado]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
    if (!vendedorSeleccionado) {
      setFormData({ nombre: "", email: "", telefono: "" });
    }
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white p-4 sm:p-6 rounded-2xl shadow mb-6">
      <h2 className="text-lg sm:text-xl font-bold text-gray-700 mb-4">
        {vendedorSeleccionado ? "✏️ Editar Vendedor" : "🧑‍💼 Nuevo Vendedor"}
      </h2>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div>
          <label className="text-sm text-gray-500 mb-1 block">Nombre</label>
          <input
            type="text"
            name="nombre"
            placeholder="Ej: Carlos López"
            value={formData.nombre}
            onChange={handleChange}
            required
            className="border p-2 rounded-lg w-full text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
          />
        </div>
        <div>
          <label className="text-sm text-gray-500 mb-1 block">Email</label>
          <input
            type="email"
            name="email"
            placeholder="Ej: carlos@email.com"
            value={formData.email}
            onChange={handleChange}
            required
            className="border p-2 rounded-lg w-full text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
          />
        </div>
        <div>
          <label className="text-sm text-gray-500 mb-1 block">Teléfono</label>
          <input
            type="text"
            name="telefono"
            placeholder="Ej: 987654321"
            value={formData.telefono}
            onChange={handleChange}
            required
            className="border p-2 rounded-lg w-full text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
          />
        </div>
      </div>
      <button
        type="submit"
        className="mt-6 w-full sm:w-auto bg-indigo-500 hover:bg-indigo-600 text-white font-semibold px-6 py-2 rounded-lg transition text-sm">
        {vendedorSeleccionado ? "Actualizar Vendedor" : "Crear Vendedor"}
      </button>
    </form>
  );
};

export default VendedorForm;