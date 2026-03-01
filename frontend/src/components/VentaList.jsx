import { useState } from "react";
import usePaginacion from "../hooks/usePaginacion";
import Paginacion from "./Paginacion";


const metodoBadge = {
  efectivo: "bg-emerald-100 text-emerald-600",
  credito: "bg-blue-100 text-blue-600",
  transferencia: "bg-purple-100 text-purple-600",
};

const VentaList = ({ ventas, vendedores, compradores, autos, onAnular, onVerDetalle }) => {
  const [busqueda, setBusqueda] = useState("");
  const [filtroMetodo, setFiltroMetodo] = useState("");
  const [ventaModal, setVentaModal] = useState(null);

  const getVendedor = (id) => vendedores.find((v) => v.id === id);
  const getComprador = (id) => compradores.find((c) => c.id === id);
  const getAuto = (id) => autos.find((a) => a.id === id);

  const ventasFiltradas = ventas.filter((v) => {
    const vendedor = getVendedor(v.vendedor)?.nombre || "";
    const comprador = getComprador(v.comprador);
    const nombreComprador = comprador ? `${comprador.nombre} ${comprador.apellido}` : "";
    const auto = getAuto(v.auto);
    const nombreAuto = auto ? `${auto.marca} ${auto.modelo}` : "";
    const texto = `${vendedor} ${nombreComprador} ${nombreAuto} ${v.id}`.toLowerCase();
    const matchBusqueda = texto.includes(busqueda.toLowerCase());
    const matchMetodo = filtroMetodo ? v.metodo_pago === filtroMetodo : true;
    return matchBusqueda && matchMetodo;
  });

  const { datosPaginados, paginaActual, totalPaginas, irAPagina, resetPagina } = usePaginacion(ventasFiltradas, 10);

  const handleBusqueda = (e) => { setBusqueda(e.target.value); resetPagina(); };
  const handleMetodo = (e) => { setFiltroMetodo(e.target.value); resetPagina(); };

  const handleImprimir = (venta) => {
    const vendedor = getVendedor(venta.vendedor);
    const comprador = getComprador(venta.comprador);
    const auto = getAuto(venta.auto);
    const ventana = window.open("", "_blank");
    ventana.document.write(`
      <html><head><title>Boleta Venta #${venta.id}</title>
      <style>
        body { font-family: Arial, sans-serif; padding: 40px; max-width: 500px; margin: auto; }
        h1 { text-align: center; color: #4f46e5; }
        .linea { border-top: 1px solid #eee; margin: 10px 0; }
        .fila { display: flex; justify-content: space-between; margin: 6px 0; }
        .label { color: #888; font-size: 13px; }
        .valor { font-weight: bold; font-size: 13px; }
        .total { font-size: 18px; color: #4f46e5; }
      </style></head>
      <body>
        <h1>🚗 Boleta de Venta</h1>
        <p style="text-align:center;color:#888">Venta #${venta.id} — ${new Date(venta.fecha).toLocaleDateString("es-PE")}</p>
        <div class="linea"></div>
        <div class="fila"><span class="label">Auto</span><span class="valor">${auto ? `${auto.marca} ${auto.modelo} (${auto.año})` : "—"}</span></div>
        <div class="fila"><span class="label">VIN/Placa</span><span class="valor">${auto?.vin || "—"}</span></div>
        <div class="fila"><span class="label">Vendedor</span><span class="valor">${vendedor?.nombre || "—"}</span></div>
        <div class="fila"><span class="label">Comprador</span><span class="valor">${comprador ? `${comprador.nombre} ${comprador.apellido}` : "—"}</span></div>
        <div class="fila"><span class="label">DNI/RUC</span><span class="valor">${comprador?.dni_ruc || "—"}</span></div>
        <div class="linea"></div>
        <div class="fila"><span class="label">Método de pago</span><span class="valor">${venta.metodo_pago || "—"}</span></div>
        <div class="fila"><span class="label">Cuotas</span><span class="valor">${venta.numero_cuotas || 1}</span></div>
        <div class="fila"><span class="label">Descuento</span><span class="valor">- S/ ${parseFloat(venta.descuento || 0).toLocaleString("es-PE")}</span></div>
        <div class="fila"><span class="label">Comisión vendedor</span><span class="valor">S/ ${parseFloat(venta.comision_vendedor || 0).toLocaleString("es-PE")}</span></div>
        <div class="linea"></div>
        <div class="fila"><span class="label total">TOTAL</span><span class="valor total">S/ ${parseFloat(venta.total).toLocaleString("es-PE")}</span></div>
        <div class="linea"></div>
        <p style="text-align:center;color:#aaa;font-size:12px;margin-top:30px">Gracias por su compra</p>
      </body></html>
    `);
    ventana.document.close();
    ventana.print();
  };

  return (
    <div className="bg-white rounded-2xl shadow">
      {/* Filtros */}
      <div className="p-4 border-b flex flex-col sm:flex-row gap-3">
        <input
          value={busqueda} onChange={handleBusqueda}
          placeholder="🔍 Buscar por vendedor, comprador, auto, ID..."
          className="border p-2 rounded-lg w-full sm:w-1/2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400" />
        <select value={filtroMetodo} onChange={handleMetodo}
          className="border p-2 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400">
          <option value="">Todos los métodos</option>
          <option value="efectivo">Efectivo</option>
          <option value="credito">Crédito</option>
          <option value="transferencia">Transferencia</option>
        </select>
      </div>

      {ventasFiltradas.length === 0 ? (
        <div className="p-10 text-center text-gray-400">
          <p className="text-4xl mb-2">🛒</p>
          <p>No se encontraron ventas.</p>
        </div>
      ) : (
        <>
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-gray-400 uppercase text-xs">
              <tr>
                <th className="px-4 py-3 text-left">ID</th>
                <th className="px-4 py-3 text-left">Fecha</th>
                <th className="px-4 py-3 text-left">Auto</th>
                <th className="px-4 py-3 text-left">Vendedor</th>
                <th className="px-4 py-3 text-left">Comprador</th>
                <th className="px-4 py-3 text-left">Método</th>
                <th className="px-4 py-3 text-center">Cuotas</th>
                <th className="px-4 py-3 text-right">Total</th>
                <th className="px-4 py-3 text-center">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {datosPaginados.map((v) => {
                const vendedor = getVendedor(v.vendedor);
                const comprador = getComprador(v.comprador);
                const auto = getAuto(v.auto);
                return (
                  <tr key={v.id} className="border-t hover:bg-gray-50 transition">
                    <td className="px-4 py-3 text-gray-400 font-mono">#{v.id}</td>
                    <td className="px-4 py-3 text-gray-500">{new Date(v.fecha).toLocaleDateString("es-PE")}</td>
                    <td className="px-4 py-3 font-semibold text-gray-700">
                      {auto ? `${auto.marca} ${auto.modelo}` : "—"}
                    </td>
                    <td className="px-4 py-3 text-gray-600">{vendedor?.nombre || "—"}</td>
                    <td className="px-4 py-3 text-gray-600">
                      {comprador ? `${comprador.nombre} ${comprador.apellido}` : <span className="text-gray-300">—</span>}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-1 rounded-full text-xs font-semibold ${metodoBadge[v.metodo_pago] || "bg-gray-100 text-gray-500"}`}>
                        {v.metodo_pago ? v.metodo_pago.charAt(0).toUpperCase() + v.metodo_pago.slice(1) : "—"}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-center text-gray-500">{v.numero_cuotas || 1}</td>
                    <td className="px-4 py-3 text-right font-bold text-gray-700">
                      S/ {parseFloat(v.total).toLocaleString("es-PE")}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex justify-center gap-1 flex-wrap">
                        <button onClick={() => setVentaModal(v)}
                          className="bg-indigo-100 text-indigo-600 hover:bg-indigo-200 px-2 py-1 rounded-lg text-xs font-semibold transition">
                          Ver
                        </button>
                        <button onClick={() => handleImprimir(v)}
                          className="bg-gray-100 text-gray-600 hover:bg-gray-200 px-2 py-1 rounded-lg text-xs font-semibold transition">
                          🖨️
                        </button>
                        {onAnular && (
                          <button onClick={() => onAnular(v.id)}
                            className="bg-red-100 text-red-500 hover:bg-red-200 px-2 py-1 rounded-lg text-xs font-semibold transition">
                            Anular
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          <div className="p-4">
            <Paginacion paginaActual={paginaActual} totalPaginas={totalPaginas} irAPagina={irAPagina} />
          </div>
        </>
      )}

      {/* Modal detalle venta */}
      {ventaModal && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6 relative">
            <button onClick={() => setVentaModal(null)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 text-xl font-bold">✕</button>
            <h2 className="text-xl font-bold text-gray-800 mb-1">🛒 Detalle de Venta</h2>
            <p className="text-gray-400 text-sm mb-4">Venta #{ventaModal.id} — {new Date(ventaModal.fecha).toLocaleDateString("es-PE")}</p>
            <div className="space-y-3">
              {[
                { label: "Auto", value: (() => { const a = getAuto(ventaModal.auto); return a ? `${a.marca} ${a.modelo} (${a.año})` : "—"; })() },
                { label: "VIN / Placa", value: getAuto(ventaModal.auto)?.vin || "—" },
                { label: "Vendedor", value: getVendedor(ventaModal.vendedor)?.nombre || "—" },
                { label: "Comprador", value: (() => { const c = getComprador(ventaModal.comprador); return c ? `${c.nombre} ${c.apellido}` : "—"; })() },
                { label: "DNI/RUC", value: getComprador(ventaModal.comprador)?.dni_ruc || "—" },
                { label: "Método de pago", value: ventaModal.metodo_pago || "—" },
                { label: "Cuotas", value: ventaModal.numero_cuotas || 1 },
                { label: "Descuento", value: `S/ ${parseFloat(ventaModal.descuento || 0).toLocaleString("es-PE")}` },
                { label: "Comisión vendedor", value: `S/ ${parseFloat(ventaModal.comision_vendedor || 0).toLocaleString("es-PE")}` },
              ].map(({ label, value }) => (
                <div key={label} className="flex justify-between border-b pb-2">
                  <span className="text-gray-400 text-sm">{label}</span>
                  <span className="font-semibold text-gray-700 text-sm">{value}</span>
                </div>
              ))}
              <div className="flex justify-between pt-2">
                <span className="text-lg font-bold text-gray-700">TOTAL</span>
                <span className="text-lg font-extrabold text-indigo-600">
                  S/ {parseFloat(ventaModal.total).toLocaleString("es-PE")}
                </span>
              </div>
            </div>
            <button onClick={() => handleImprimir(ventaModal)}
              className="mt-6 w-full bg-indigo-500 hover:bg-indigo-600 text-white font-semibold py-2 rounded-lg transition">
              🖨️ Imprimir boleta
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default VentaList;