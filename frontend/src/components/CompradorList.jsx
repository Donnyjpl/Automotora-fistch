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
      <table className="w-full text-sm">
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
              <td className="px-4 py-3 font-semibold text-gray-700 flex items-center gap-2">
                <span className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center font-bold text-xs">
                  {c.nombre[0].toUpperCase()}
                </span>
                {c.nombre} {c.apellido}
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