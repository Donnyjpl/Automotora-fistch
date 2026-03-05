const Paginacion = ({ paginaActual, totalPaginas, irAPagina }) => {
  if (totalPaginas <= 1) return null;

  // En móvil mostramos máximo 3 páginas alrededor de la actual
  const getPaginas = () => {
    if (totalPaginas <= 5) return Array.from({ length: totalPaginas }, (_, i) => i + 1);
    const paginas = new Set([1, totalPaginas, paginaActual]);
    if (paginaActual > 1) paginas.add(paginaActual - 1);
    if (paginaActual < totalPaginas) paginas.add(paginaActual + 1);
    return Array.from(paginas).sort((a, b) => a - b);
  };

  const paginas = getPaginas();

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-3 mt-4 px-1">
      <p className="text-sm text-gray-400">
        Página <span className="font-semibold text-gray-600">{paginaActual}</span> de{" "}
        <span className="font-semibold text-gray-600">{totalPaginas}</span>
      </p>
      <div className="flex gap-1 flex-wrap justify-center">
        <button
          onClick={() => irAPagina(paginaActual - 1)}
          disabled={paginaActual === 1}
          className="px-3 py-1 rounded-lg text-sm border text-gray-500 hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed transition">
          ‹
        </button>
        {paginas.map((n, i) => {
          const anterior = paginas[i - 1];
          const mostrarPuntos = anterior && n - anterior > 1;
          return (
            <span key={n} className="flex gap-1 items-center">
              {mostrarPuntos && (
                <span className="px-1 text-gray-300 text-sm">…</span>
              )}
              <button
                onClick={() => irAPagina(n)}
                className={`px-3 py-1 rounded-lg text-sm border transition ${
                  n === paginaActual
                    ? "bg-indigo-500 text-white border-indigo-500 font-bold"
                    : "text-gray-500 hover:bg-gray-100"
                }`}>
                {n}
              </button>
            </span>
          );
        })}
        <button
          onClick={() => irAPagina(paginaActual + 1)}
          disabled={paginaActual === totalPaginas}
          className="px-3 py-1 rounded-lg text-sm border text-gray-500 hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed transition">
          ›
        </button>
      </div>
    </div>
  );
};

export default Paginacion;