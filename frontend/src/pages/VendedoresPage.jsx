import { useEffect, useState } from "react";
import {
  getVendedores,
  createVendedor,
  updateVendedor,
  deleteVendedor,
} from "../api/vendedorApi.js";

import VendedorForm from "../components/VendedorForm.jsx";
import VendedorList from "../components/VendedorList.jsx";

const VendedoresPage = () => {
  const [vendedores, setVendedores] = useState([]);
  const [vendedorSeleccionado, setVendedorSeleccionado] = useState(null);

  const cargarVendedores = async () => {
    try {
      const response = await getVendedores();
      console.log("Vendedores obtenidos: ", response.data);
      setVendedores(response.data);
    } catch (error) {
      console.error("Error al cargar vendedores:", error);
    }
  };

  useEffect(() => {
    cargarVendedores();
  }, []);

  const handleSubmit = async (vendedorData) => {
  try {
    if (vendedorSeleccionado) {
      // Actualizar vendedor
      await updateVendedor(vendedorSeleccionado.id, vendedorData);
      setVendedorSeleccionado(null); // limpiar selección después de actualizar
    } else {
      // Crear nuevo vendedor
      console.log("Creando vendedor con datos: ", vendedorData);
      await createVendedor(vendedorData);
    }
    cargarVendedores(); // recarga la lista actualizada
  } catch (error) {
    console.error("Error al guardar vendedor:", error);
  }
};

  const handleEdit = (vendedor) => {
    setVendedorSeleccionado(vendedor);
  };

  const handleDelete = async (id) => {
    try {
      await deleteVendedor(id);
      cargarVendedores();
    } catch (error) {
      console.error("Error al eliminar vendedor:", error);
    }
  };

  return (
    <div>
      <h1>Gestión de Vendedores</h1>
      <VendedorForm
        onSubmit={handleSubmit}
        vendedorSeleccionado={vendedorSeleccionado}
      />
      <VendedorList
        vendedores={vendedores}
        onEdit={handleEdit}
        onDelete={handleDelete}
      />
    </div>
  );
};

export default VendedoresPage;