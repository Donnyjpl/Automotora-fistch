const Paginacion = ({ paginaActual, totalPaginas, irAPagina }) => {
  if (totalPaginas <= 1) return null;

  return (
    <div className="flex items-center justify-between mt-4 px-1">
      <p className="text-sm text-gray-400">
        Página <span className="font-semibold text-gray-600">{paginaActual}</span> de{" "}
        <span className="font-semibold text-gray-600">{totalPaginas}</span>
      </p>
      <div className="flex gap-1">
        <button
          onClick={() => irAPagina(paginaActual - 1)}
          disabled={paginaActual === 1}
          className="px-3 py-1 rounded-lg text-sm border text-gray-500 hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed transition">
          ‹ Anterior
        </button>
        {Array.from({ length: totalPaginas }, (_, i) => i + 1).map((n) => (
          <button
            key={n}
            onClick={() => irAPagina(n)}
            className={`px-3 py-1 rounded-lg text-sm border transition ${
              n === paginaActual
                ? "bg-indigo-500 text-white border-indigo-500 font-bold"
                : "text-gray-500 hover:bg-gray-100"
            }`}>
            {n}
          </button>
        ))}
        <button
          onClick={() => irAPagina(paginaActual + 1)}
          disabled={paginaActual === totalPaginas}
          className="px-3 py-1 rounded-lg text-sm border text-gray-500 hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed transition">
          Siguiente ›
        </button>
      </div>
    </div>
  );
};

export default Paginacion;