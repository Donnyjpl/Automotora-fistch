import { useEffect, useState } from "react";
import { getAutos, createAuto, updateAuto, deleteAuto } from "../api/autoApi";
import AutoForm from "../components/AutoForm";
import AutoList from "../components/AutoList";
import toast from "react-hot-toast";

const AutosPage = () => {
  const [autos, setAutos] = useState([]);
  const [autoSeleccionado, setAutoSeleccionado] = useState(null);

  useEffect(() => { cargarAutos(); }, []);

  const cargarAutos = async () => {
    try {
      const res = await getAutos();
      setAutos(res.data);
    } catch {
      toast.error("Error al cargar autos");
    }
  };

  const handleSubmit = async (data) => {
    if (autoSeleccionado) {
      await updateAuto(autoSeleccionado.id, data);
      setAutoSeleccionado(null);
    } else {
      await createAuto(data);
    }
    cargarAutos();
  };

  const handleEdit = (auto) => {
    setAutoSeleccionado(auto);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleDelete = async (id) => {
    try {
      await deleteAuto(id);
      toast.success("Auto eliminado");
      cargarAutos();
    } catch {
      toast.error("No se puede eliminar: el auto tiene ventas asociadas");
    }
  };

  return (
    <div className="p-3 sm:p-8 min-h-screen bg-gray-50">
      <div className="mb-4 sm:mb-6">
        <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-800">🚗 Autos</h1>
        <p className="text-gray-400 text-sm mt-1">Gestión del inventario de autos</p>
      </div>

      <AutoForm onSubmit={handleSubmit} autoSeleccionado={autoSeleccionado} />

      {autoSeleccionado && (
        <button
          onClick={() => setAutoSeleccionado(null)}
          className="mb-4 text-sm text-gray-400 hover:text-gray-600 underline">
          Cancelar edición
        </button>
      )}

      <AutoList autos={autos} onEdit={handleEdit} onDelete={handleDelete} />
    </div>
  );
};

export default AutosPage;