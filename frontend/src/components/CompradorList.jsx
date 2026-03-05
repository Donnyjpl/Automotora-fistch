import toast from "react-hot-toast";

const CompradorList = ({ compradores, onEdit, onDelete }) => {
  const handleDelete = (id) => {
    toast((t) => (
      <div className="flex flex-col gap-2">
        <p className="font-semibold">¿Eliminar este comprador?</p>
        <div className="flex gap-2">
          <button
            onClick={() => { onDelete(id); toast.dismiss(t.id); }}
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

  if (compradores.length === 0) {
    return (
      <div className="bg-white rounded-2xl shadow p-8 text-center text-gray-400">
        <p className="text-4xl mb-2">👤</p>
        <p>No hay compradores registrados aún.</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl shadow overflow-hidden">

      {/* ── Vista móvil: tarjetas ── */}
      <div className="flex flex-col divide-y sm:hidden">
        {compradores.map((c, i) => (
          <div key={c.id} className="p-4 flex items-start gap-3">
            <span className="w-9 h-9 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center font-bold text-sm flex-shrink-0">
              {c.nombre[0].toUpperCase()}
            </span>
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-gray-700 text-sm">
                {c.nombre} {c.apellido}
              </p>
              <div className="flex flex-wrap gap-x-4 gap-y-0.5 mt-1">
                {c.dni_ruc && (
                  <p className="text-gray-400 text-xs">DNI/RUC: {c.dni_ruc}</p>
                )}
                {c.telefono && (
                  <p className="text-gray-400 text-xs">📞 {c.telefono}</p>
                )}
              </div>
              {c.direccion && (
                <p className="text-gray-400 text-xs mt-0.5 truncate">📍 {c.direccion}</p>
              )}
              <div className="flex gap-2 mt-2">
                <button onClick={() => onEdit(c)}
                  className="bg-amber-100 text-amber-600 hover:bg-amber-200 px-3 py-1 rounded-lg text-xs font-semibold transition">
                  Editar
                </button>
                <button onClick={() => handleDelete(c.id)}
                  className="bg-red-100 text-red-500 hover:bg-red-200 px-3 py-1 rounded-lg text-xs font-semibold transition">
                  Eliminar
                </button>
              </div>
            </div>
            <span className="text-gray-200 font-bold text-sm flex-shrink-0">{i + 1}</span>
          </div>
        ))}
      </div>

      {/* ── Vista desktop: tabla ── */}
      <table className="hidden sm:table w-full text-sm">
        <thead className="bg-gray-50 text-gray-400 uppercase text-xs">
          <tr>
            <th className="px-4 py-3 text-left">#</th>
            <th className="px-4 py-3 text-left">Nombre</th>
            <th className="px-4 py-3 text-left">DNI / RUC</th>
            <th className="px-4 py-3 text-left">Teléfono</th>
            <th className="px-4 py-3 text-left">Dirección</th>
            <th className="px-4 py-3 text-center">Acciones</th>
          </tr>
        </thead>
        <tbody>
          {compradores.map((c, i) => (
            <tr key={c.id} className="border-t hover:bg-gray-50 transition">
              <td className="px-4 py-3 text-gray-400">{i + 1}</td>
              <td className="px-4 py-3 font-semibold text-gray-700">
                <div className="flex items-center gap-2">
                  <span className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center font-bold text-xs flex-shrink-0">
                    {c.nombre[0].toUpperCase()}
                  </span>
                  {c.nombre} {c.apellido}
                </div>
              </td>
              <td className="px-4 py-3 text-gray-500">{c.dni_ruc}</td>
              <td className="px-4 py-3 text-gray-500">{c.telefono}</td>
              <td className="px-4 py-3 text-gray-500">{c.direccion}</td>
              <td className="px-4 py-3 text-center">
                <div className="flex justify-center gap-2">
                  <button onClick={() => onEdit(c)}
                    className="bg-amber-100 text-amber-600 hover:bg-amber-200 px-3 py-1 rounded-lg text-xs font-semibold transition">
                    Editar
                  </button>
                  <button onClick={() => handleDelete(c.id)}
                    className="bg-red-100 text-red-500 hover:bg-red-200 px-3 py-1 rounded-lg text-xs font-semibold transition">
                    Eliminar
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

    </div>
  );
};

export default CompradorList;