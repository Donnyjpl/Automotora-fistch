import { useEffect, useState } from "react";
import { getCompradores, createComprador, updateComprador, deleteComprador } from "../api/compradorApi";
import CompradorForm from "../components/CompradorForm";
import CompradorList from "../components/CompradorList";
import toast from "react-hot-toast";

const CompradorPage = () => {
  const [compradores, setCompradores] = useState([]);
  const [compradorSeleccionado, setCompradorSeleccionado] = useState(null);

  useEffect(() => { cargarCompradores(); }, []);

  const cargarCompradores = async () => {
    try {
      const res = await getCompradores();
      setCompradores(res.data);
    } catch {
      toast.error("Error al cargar compradores");
    }
  };

  const handleSubmit = async (data) => {
    if (compradorSeleccionado) {
      await updateComprador(compradorSeleccionado.id, data);
      setCompradorSeleccionado(null);
    } else {
      await createComprador(data);
    }
    cargarCompradores();
  };

  const handleEdit = (comprador) => {
    setCompradorSeleccionado(comprador);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleDelete = async (id) => {
    try {
      await deleteComprador(id);
      toast.success("Comprador eliminado");
      cargarCompradores();
    } catch {
      toast.error("No se puede eliminar: el comprador tiene ventas asociadas");
    }
  };

  return (
    <div className="p-8 min-h-screen bg-gray-50">
      <div className="mb-6">
        <h1 className="text-3xl font-extrabold text-gray-800">👤 Compradores</h1>
        <p className="text-gray-400 mt-1">Gestión de compradores registrados</p>
      </div>

      <CompradorForm
        onSubmit={handleSubmit}
        compradorSeleccionado={compradorSeleccionado}
      />

      {compradorSeleccionado && (
        <button
          onClick={() => setCompradorSeleccionado(null)}
          className="mb-4 text-sm text-gray-400 hover:text-gray-600 underline">
          Cancelar edición
        </button>
      )}

      <CompradorList
        compradores={compradores}
        onEdit={handleEdit}
        onDelete={handleDelete}
      />
    </div>
  );
};

export default CompradorPage;