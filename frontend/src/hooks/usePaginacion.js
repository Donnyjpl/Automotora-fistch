import { useState, useMemo } from "react";

const usePaginacion = (datos, porPagina = 10) => {
  const [paginaActual, setPaginaActual] = useState(1);

  const totalPaginas = Math.ceil(datos.length / porPagina);

  const datosPaginados = useMemo(() => {
    const inicio = (paginaActual - 1) * porPagina;
    return datos.slice(inicio, inicio + porPagina);
  }, [datos, paginaActual, porPagina]);

  const irAPagina = (n) => {
    if (n >= 1 && n <= totalPaginas) setPaginaActual(n);
  };

  const resetPagina = () => setPaginaActual(1);

  return { datosPaginados, paginaActual, totalPaginas, irAPagina, resetPagina };
};

export default usePaginacion;