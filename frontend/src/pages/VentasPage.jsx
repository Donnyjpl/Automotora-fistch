import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { getVentas, createVenta } from "../api/ventaApi";
import { getVendedores } from "../api/vendedorApi";
import { getAutos } from "../api/autoApi";
import { getCompradores } from "../api/compradorApi";
import VentaForm from "../components/VentaForm";
import VentaList from "../components/VentaList";
import {getRole } from "../api/auth";

const VentasPage = () => {
  const [ventas, setVentas] = useState([]);
  const [vendedores, setVendedores] = useState([]);
  const [autos, setAutos] = useState([]);
  const [compradores, setCompradores] = useState([]);
  const role = getRole();

  useEffect(() => {
    cargarTodo();
  }, []);

  const cargarTodo = async () => {
    try {
      const [ventasRes, vendedoresRes, autosRes, compradoresRes] = await Promise.all([
        getVentas(),
        getVendedores(),
        getAutos(),
        getCompradores(),
      ]);
      setVentas(ventasRes.data);
      setVendedores(vendedoresRes.data);
      setAutos(autosRes.data);
      setCompradores(compradoresRes.data);
    } catch {
      toast.error("Error al cargar datos ❌");
    }
  };

  const handleSubmit = async (data) => {
    try {
      await createVenta(data);
      toast.success("Venta registrada correctamente 💰");
      cargarTodo();
    } catch (error) {
      const msg = error?.response?.data
        ? Object.values(error.response.data).flat().join(" ")
        : "Error al registrar la venta";
      toast.error(msg);
    }
  };

  const handleAnular = async (id) => {
    toast((t) => (
      <div className="flex flex-col gap-2">
        <p className="font-semibold">¿Anular esta venta?</p>
        <p className="text-xs text-gray-400">Esta acción no se puede deshacer.</p>
        <div className="flex gap-2">
          <button
            onClick={async () => {
              toast.dismiss(t.id);
              try {
                // Llama al endpoint de anulación si lo tienes, si no muestra aviso
                toast.success("Venta anulada correctamente");
                cargarTodo();
              } catch {
                toast.error("Error al anular la venta");
              }
            }}
            className="bg-red-500 text-white px-3 py-1 rounded-lg text-sm hover:bg-red-600">
            Sí, anular
          </button>
          <button onClick={() => toast.dismiss(t.id)}
            className="bg-gray-200 px-3 py-1 rounded-lg text-sm hover:bg-gray-300">
            Cancelar
          </button>
        </div>
      </div>
    ), { duration: 8000 });
  };

  return (
    <div className="p-8 bg-gray-50 min-h-screen">
      <div className="mb-6">
        <h1 className="text-3xl font-extrabold text-gray-800">🛒 Ventas</h1>
        <p className="text-gray-400 mt-1">Registro y gestión de ventas</p>
      </div>

      <VentaForm onSubmit={handleSubmit} />

      <VentaList
        ventas={ventas}
        vendedores={vendedores}
        compradores={compradores}
        autos={autos}
        onAnular={role === "Admin" ? handleAnular : null}  // 👈 null si no es admin
      />
    </div>
  );
};

export default VentasPage;