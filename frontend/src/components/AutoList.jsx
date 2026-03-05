import { useState } from "react";
import toast from "react-hot-toast";
import usePaginacion from "../hooks/usePaginacion";
import Paginacion from "./Paginacion";

const estadoBadge = {
  disponible: "bg-emerald-100 text-emerald-600",
  reservado: "bg-amber-100 text-amber-600",
  vendido: "bg-red-100 text-red-500",
};

const combustibleIcon = {
  gasolina: "⛽",
  diesel: "🛢️",
  electrico: "⚡",
  hibrido: "🔋",
  gas: "💨",
};

const AutoList = ({ autos, onEdit, onDelete }) => {
  const [busqueda, setBusqueda] = useState("");
  const [filtroEstado, setFiltroEstado] = useState("");
  const [filtroCombustible, setFiltroCombustible] = useState("");

  const autosFiltrados = autos.filter((a) => {
    const texto = `${a.marca} ${a.modelo} ${a.vin || ""} ${a.color || ""}`.toLowerCase();
    const matchBusqueda = texto.includes(busqueda.toLowerCase());
    const matchEstado = filtroEstado ? a.estado === filtroEstado : true;
    const matchCombustible = filtroCombustible ? a.combustible === filtroCombustible : true;
    return matchBusqueda && matchEstado && matchCombustible;
  });

  const { datosPaginados, paginaActual, totalPaginas, irAPagina, resetPagina } = usePaginacion(autosFiltrados, 10);

  const handleBusqueda = (e) => { setBusqueda(e.target.value); resetPagina(); };
  const handleEstado = (e) => { setFiltroEstado(e.target.value); resetPagina(); };
  const handleCombustible = (e) => { setFiltroCombustible(e.target.value); resetPagina(); };

  const handleDelete = (id) => {
    toast((t) => (
      <div className="flex flex-col gap-2">
        <p className="font-semibold">¿Eliminar este auto?</p>
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

  return (
    <div className="bg-white rounded-2xl shadow">

      {/* Filtros */}
      <div className="p-3 sm:p-4 border-b flex flex-col sm:flex-row gap-3">
        <input
          value={busqueda} onChange={handleBusqueda}
          placeholder="🔍 Buscar por marca, modelo, color, VIN..."
          className="border p-2 rounded-lg w-full sm:w-1/2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400" />
        <select value={filtroEstado} onChange={handleEstado}
          className="border p-2 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 w-full sm:w-auto">
          <option value="">Todos los estados</option>
          <option value="disponible">Disponible</option>
          <option value="reservado">Reservado</option>
          <option value="vendido">Vendido</option>
        </select>
        <select value={filtroCombustible} onChange={handleCombustible}
          className="border p-2 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 w-full sm:w-auto">
          <option value="">Todos los combustibles</option>
          <option value="gasolina">Gasolina</option>
          <option value="diesel">Diésel</option>
          <option value="electrico">Eléctrico</option>
          <option value="hibrido">Híbrido</option>
          <option value="gas">Gas</option>
        </select>
      </div>

      {autosFiltrados.length === 0 ? (
        <div className="p-10 text-center text-gray-400">
          <p className="text-4xl mb-2">🚗</p>
          <p>No se encontraron autos con esos filtros.</p>
        </div>
      ) : (
        <>
          {/* ── Vista móvil: tarjetas ── */}
          <div className="flex flex-col divide-y sm:hidden">
            {datosPaginados.map((auto) => (
              <div key={auto.id} className="p-4">
                <div className="flex justify-between items-start mb-1">
                  <p className="font-bold text-gray-700">{auto.marca} {auto.modelo}</p>
                  <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${estadoBadge[auto.estado] || "bg-gray-100 text-gray-500"}`}>
                    {auto.estado}
                  </span>
                </div>
                <p className="text-indigo-600 font-extrabold text-sm mb-2">
                  S/ {parseFloat(auto.precio).toLocaleString("es-PE")}
                </p>
                <div className="flex flex-wrap gap-x-4 gap-y-0.5 text-xs text-gray-500 mb-3">
                  <span>📅 {auto.año}</span>
                  {auto.color && (
                    <span className="flex items-center gap-1">
                      <span className="w-2.5 h-2.5 rounded-full border inline-block"
                        style={{ backgroundColor: auto.color.toLowerCase() }} />
                      {auto.color}
                    </span>
                  )}
                  <span>{combustibleIcon[auto.combustible]} {auto.combustible || "—"}</span>
                  {auto.kilometraje != null && (
                    <span>🛣️ {auto.kilometraje.toLocaleString()} km</span>
                  )}
                  {auto.vin && <span>🔖 {auto.vin}</span>}
                </div>
                <div className="flex gap-2">
                  <button onClick={() => onEdit(auto)}
                    className="bg-amber-100 text-amber-600 hover:bg-amber-200 px-3 py-1 rounded-lg text-xs font-semibold transition">
                    Editar
                  </button>
                  <button onClick={() => handleDelete(auto.id)}
                    className="bg-red-100 text-red-500 hover:bg-red-200 px-3 py-1 rounded-lg text-xs font-semibold transition">
                    Eliminar
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* ── Vista desktop: tabla ── */}
          <table className="hidden sm:table w-full text-sm">
            <thead className="bg-gray-50 text-gray-400 uppercase text-xs">
              <tr>
                <th className="px-4 py-3 text-left">Auto</th>
                <th className="px-4 py-3 text-left">Año</th>
                <th className="px-4 py-3 text-left">Color</th>
                <th className="px-4 py-3 text-left">Combustible</th>
                <th className="px-4 py-3 text-left">KM</th>
                <th className="px-4 py-3 text-left">VIN / Placa</th>
                <th className="px-4 py-3 text-right">Precio</th>
                <th className="px-4 py-3 text-center">Estado</th>
                <th className="px-4 py-3 text-center">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {datosPaginados.map((auto) => (
                <tr key={auto.id} className="border-t hover:bg-gray-50 transition">
                  <td className="px-4 py-3 font-semibold text-gray-700">
                    {auto.marca} {auto.modelo}
                  </td>
                  <td className="px-4 py-3 text-gray-500">{auto.año}</td>
                  <td className="px-4 py-3 text-gray-500">
                    {auto.color ? (
                      <span className="flex items-center gap-1">
                        <span className="w-3 h-3 rounded-full border"
                          style={{ backgroundColor: auto.color.toLowerCase() }} />
                        {auto.color}
                      </span>
                    ) : "—"}
                  </td>
                  <td className="px-4 py-3 text-gray-500">
                    {combustibleIcon[auto.combustible] || ""} {auto.combustible || "—"}
                  </td>
                  <td className="px-4 py-3 text-gray-500">
                    {auto.kilometraje != null ? auto.kilometraje.toLocaleString() + " km" : "—"}
                  </td>
                  <td className="px-4 py-3 text-gray-400 text-xs">{auto.vin || "—"}</td>
                  <td className="px-4 py-3 text-right font-semibold text-gray-700">
                    S/ {parseFloat(auto.precio).toLocaleString("es-PE")}
                  </td>
                  <td className="px-4 py-3 text-center">
                    <span className={`px-2 py-1 rounded-full text-xs font-semibold ${estadoBadge[auto.estado] || "bg-gray-100 text-gray-500"}`}>
                      {auto.estado}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <div className="flex justify-center gap-2">
                      <button onClick={() => onEdit(auto)}
                        className="bg-amber-100 text-amber-600 hover:bg-amber-200 px-3 py-1 rounded-lg text-xs font-semibold transition">
                        Editar
                      </button>
                      <button onClick={() => handleDelete(auto.id)}
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

export default AutoList;