import { useState } from "react";
import toast from "react-hot-toast";
import usePaginacion from "../hooks/usePaginacion";
import Paginacion from "./Paginacion";

const VendedorList = ({ vendedores, onEdit, onDelete }) => {
  const [busqueda, setBusqueda] = useState("");

  const vendedoresFiltrados = vendedores.filter((v) => {
    const texto = `${v.nombre} ${v.email} ${v.telefono}`.toLowerCase();
    return texto.includes(busqueda.toLowerCase());
  });

  const { datosPaginados, paginaActual, totalPaginas, irAPagina, resetPagina } = usePaginacion(vendedoresFiltrados, 10);

  const handleBusqueda = (e) => { setBusqueda(e.target.value); resetPagina(); };

  const handleDelete = (id) => {
    toast((t) => (
      <div className="flex flex-col gap-2">
        <p className="font-semibold">¿Eliminar este vendedor?</p>
        <div className="flex gap-2">
          <button onClick={() => { onDelete(id); toast.dismiss(t.id); }}
            className="bg-red-500 text-white px-3 py-1 rounded-lg text-sm hover:bg-red-600">
            Sí, eliminar
          </button>
          <button onClick={() => toast.dismiss(t.id)}
            className="bg-gray-200 px-3 py-1 rounded-lg text-sm hover:bg-gray-300">
            Cancelar
          </button>
        </div>
      </div>
    ), { duration: 6000 });
  };

  if (vendedores.length === 0) {
    return (
      <div className="bg-white rounded-2xl shadow p-10 text-center text-gray-400">
        <p className="text-4xl mb-2">🧑‍💼</p>
        <p>No hay vendedores registrados aún.</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl shadow">
      {/* Filtro */}
      <div className="p-3 sm:p-4 border-b">
        <input
          value={busqueda} onChange={handleBusqueda}
          placeholder="🔍 Buscar por nombre, email o teléfono..."
          className="border p-2 rounded-lg w-full sm:w-96 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400" />
      </div>

      {vendedoresFiltrados.length === 0 ? (
        <p className="text-center text-gray-400 py-8">No se encontraron vendedores.</p>
      ) : (
        <>
          {/* ── Vista móvil: tarjetas ── */}
          <div className="flex flex-col divide-y sm:hidden">
            {datosPaginados.map((v, i) => (
              <div key={v.id} className="p-4 flex items-start gap-3">
                <span className="w-10 h-10 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center font-bold text-sm flex-shrink-0">
                  {v.nombre[0].toUpperCase()}
                </span>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-gray-700 text-sm">{v.nombre}</p>
                  <p className="text-gray-400 text-xs truncate">{v.email}</p>
                  {v.telefono && (
                    <p className="text-gray-400 text-xs">📞 {v.telefono}</p>
                  )}
                  <div className="flex gap-2 mt-2">
                    <button onClick={() => onEdit(v)}
                      className="bg-amber-100 text-amber-600 hover:bg-amber-200 px-3 py-1 rounded-lg text-xs font-semibold transition">
                      Editar
                    </button>
                    <button onClick={() => handleDelete(v.id)}
                      className="bg-red-100 text-red-500 hover:bg-red-200 px-3 py-1 rounded-lg text-xs font-semibold transition">
                      Eliminar
                    </button>
                  </div>
                </div>
                <span className="text-gray-200 font-bold text-sm flex-shrink-0">
                  {(paginaActual - 1) * 10 + i + 1}
                </span>
              </div>
            ))}
          </div>

          {/* ── Vista desktop: tabla ── */}
          <table className="hidden sm:table w-full text-sm">
            <thead className="bg-gray-50 text-gray-400 uppercase text-xs">
              <tr>
                <th className="px-4 py-3 text-left">#</th>
                <th className="px-4 py-3 text-left">Vendedor</th>
                <th className="px-4 py-3 text-left">Email</th>
                <th className="px-4 py-3 text-left">Teléfono</th>
                <th className="px-4 py-3 text-center">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {datosPaginados.map((v, i) => (
                <tr key={v.id} className="border-t hover:bg-gray-50 transition">
                  <td className="px-4 py-3 text-gray-300 font-bold">{(paginaActual - 1) * 10 + i + 1}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <span className="w-9 h-9 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center font-bold text-sm">
                        {v.nombre[0].toUpperCase()}
                      </span>
                      <span className="font-semibold text-gray-700">{v.nombre}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-gray-500">{v.email}</td>
                  <td className="px-4 py-3 text-gray-500">{v.telefono}</td>
                  <td className="px-4 py-3 text-center">
                    <div className="flex justify-center gap-2">
                      <button onClick={() => onEdit(v)}
                        className="bg-amber-100 text-amber-600 hover:bg-amber-200 px-3 py-1 rounded-lg text-xs font-semibold transition">
                        Editar
                      </button>
                      <button onClick={() => handleDelete(v.id)}
                        className="bg-red-100 text-red-500 hover:bg-red-200 px-3 py-1 rounded-lg text-xs font-semibold transition">
                        Eliminar
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          <div className="p-4">
            <Paginacion paginaActual={paginaActual} totalPaginas={totalPaginas} irAPagina={irAPagina} />
          </div>
        </>
      )}
    </div>
  );
};

export default VendedorList;