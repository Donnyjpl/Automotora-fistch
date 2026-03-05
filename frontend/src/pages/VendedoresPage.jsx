import { useEffect, useState } from "react";
import {
  getVendedores,
  createVendedor,
  updateVendedor,
  deleteVendedor,
} from "../api/vendedorApi.js";
import VendedorForm from "../components/VendedorForm.jsx";
import VendedorList from "../components/VendedorList.jsx";
import toast from "react-hot-toast";

const VendedoresPage = () => {
  const [vendedores, setVendedores] = useState([]);
  const [vendedorSeleccionado, setVendedorSeleccionado] = useState(null);

  const cargarVendedores = async () => {
    try {
      const response = await getVendedores();
      setVendedores(response.data);
    } catch (error) {
      console.error("Error al cargar vendedores:", error);
      toast.error("Error al cargar vendedores");
    }
  };

  useEffect(() => {
    cargarVendedores();
  }, []);

  const handleSubmit = async (vendedorData) => {
    try {
      if (vendedorSeleccionado) {
        await updateVendedor(vendedorSeleccionado.id, vendedorData);
        toast.success("Vendedor actualizado");
        setVendedorSeleccionado(null);
      } else {
        await createVendedor(vendedorData);
        toast.success("Vendedor creado");
      }
      cargarVendedores();
    } catch (error) {
      console.error("Error al guardar vendedor:", error);
      toast.error("Error al guardar vendedor");
    }
  };

  const handleEdit = (vendedor) => {
    setVendedorSeleccionado(vendedor);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleDelete = async (id) => {
    try {
      await deleteVendedor(id);
      toast.success("Vendedor eliminado");
      cargarVendedores();
    } catch (error) {
      console.error("Error al eliminar vendedor:", error);
      toast.error("No se puede eliminar: el vendedor tiene ventas asociadas");
    }
  };

  return (
    <div className="p-3 sm:p-8 min-h-screen bg-gray-50">
      <div className="mb-4 sm:mb-6">
        <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-800">🧑‍💼 Vendedores</h1>
        <p className="text-gray-400 text-sm mt-1">Gestión de vendedores registrados</p>
      </div>

      <VendedorForm
        onSubmit={handleSubmit}
        vendedorSeleccionado={vendedorSeleccionado}
      />

      {vendedorSeleccionado && (
        <button
          onClick={() => setVendedorSeleccionado(null)}
          className="mb-4 text-sm text-gray-400 hover:text-gray-600 underline">
          Cancelar edición
        </button>
      )}

      <VendedorList
        vendedores={vendedores}
        onEdit={handleEdit}
        onDelete={handleDelete}
      />
    </div>
  );
};

export default VendedoresPage;