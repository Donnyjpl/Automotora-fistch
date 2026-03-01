import { useEffect, useState } from "react";
import { getVendedores } from "../api/vendedorApi";
import { getAutos } from "../api/autoApi";
import { getVentas } from "../api/ventaApi";
import { getCompradores } from "../api/compradorApi";
import GraficaVentasPorMes from "../components/GraficaVentasPorMes";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend,
} from "recharts";

const COLORS = ["#6366f1", "#f43f5e", "#10b981", "#f59e0b", "#3b82f6"];

const KPICard = ({ title, value, subtitle, icon, color }) => (
  <div className={`bg-white rounded-2xl shadow p-6 border-l-4 ${color} hover:shadow-xl transition-all duration-300`}>
    <div className="flex items-center justify-between mb-2">
      <span className="text-gray-500 text-sm font-medium uppercase tracking-wide">{title}</span>
      <span className="text-2xl">{icon}</span>
    </div>
    <p className="text-3xl font-extrabold text-gray-800 truncate">{value}</p>
    {subtitle && <p className="text-gray-400 text-sm mt-1">{subtitle}</p>}
  </div>
);

const Dashboard = () => {
  const [vendedores, setVendedores] = useState([]);
  const [autos, setAutos] = useState([]);
  const [ventas, setVentas] = useState([]);
  const [compradores, setCompradores] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const cargarDatos = async () => {
      try {
        const [vRes, aRes, veRes, cRes] = await Promise.all([
          getVendedores(),
          getAutos(),
          getVentas(),
          getCompradores(),
        ]);
        setVendedores(vRes.data);
        setAutos(aRes.data);
        setVentas(veRes.data);
        setCompradores(cRes.data);
      } catch (err) {
        console.error("Error al cargar datos del dashboard:", err);
      } finally {
        setLoading(false);
      }
    };
    cargarDatos();
  }, []);

  // ── KPIs ──────────────────────────────────────────────────────────────
  const totalVentas = ventas.length;
  const totalIngresos = ventas.reduce((acc, v) => acc + parseFloat(v.total || 0), 0);
  const totalDescuentos = ventas.reduce((acc, v) => acc + parseFloat(v.descuento || 0), 0);
  const totalComisiones = ventas.reduce((acc, v) => acc + parseFloat(v.comision_vendedor || 0), 0);
  const autosDisponibles = autos.filter((a) => a.estado === "disponible").length;
  const autosReservados = autos.filter((a) => a.estado === "reservado").length;
  const autosVendidos = autos.filter((a) => a.estado === "vendido").length;
  const tasaConversion = autos.length > 0
    ? ((autosVendidos / autos.length) * 100).toFixed(1) : 0;

  // Vendedor estrella
  const ventasPorVendedorMap = {};
  ventas.forEach((v) => {
    ventasPorVendedorMap[v.vendedor] = (ventasPorVendedorMap[v.vendedor] || 0) + 1;
  });
  const vendedorEstrellaId = Object.entries(ventasPorVendedorMap)
    .sort((a, b) => b[1] - a[1])[0]?.[0];
  const vendedorEstrella = vendedores.find(
    (v) => v.id === parseInt(vendedorEstrellaId)
  )?.nombre || "—";

  // Auto más y menos vendido
  const ventasPorModeloMap = {};
  ventas.forEach((v) => {
    const auto = autos.find((a) => a.id === v.auto);
    if (auto) {
      const key = `${auto.marca} ${auto.modelo}`;
      ventasPorModeloMap[key] = (ventasPorModeloMap[key] || 0) + 1;
    }
  });
  const modelosOrdenados = Object.entries(ventasPorModeloMap).sort((a, b) => b[1] - a[1]);
  const autoMasVendido = modelosOrdenados[0]
    ? `${modelosOrdenados[0][0]} (${modelosOrdenados[0][1]})` : "—";
  const autoMenosVendido = modelosOrdenados[modelosOrdenados.length - 1]
    ? `${modelosOrdenados[modelosOrdenados.length - 1][0]} (${modelosOrdenados[modelosOrdenados.length - 1][1]})` : "—";

  // Gráficas
  const dataBarras = vendedores.map((v) => ({
    nombre: v.nombre,
    ventas: ventasPorVendedorMap[v.id] || 0,
    ingresos: ventas
      .filter((venta) => venta.vendedor === v.id)
      .reduce((acc, venta) => acc + parseFloat(venta.total || 0), 0),
  }));

  const dataDona = [
    { name: "Disponibles", value: autosDisponibles },
    { name: "Reservados",  value: autosReservados },
    { name: "Vendidos",    value: autosVendidos },
  ].filter((d) => d.value > 0);

  const combustibleMap = {};
  autos.forEach((a) => {
    if (a.combustible) combustibleMap[a.combustible] = (combustibleMap[a.combustible] || 0) + 1;
  });
  const dataCombustible = Object.entries(combustibleMap).map(([name, value]) => ({
    name: name.charAt(0).toUpperCase() + name.slice(1), value,
  }));

  const metodoPagoMap = {};
  ventas.forEach((v) => {
    if (v.metodo_pago) metodoPagoMap[v.metodo_pago] = (metodoPagoMap[v.metodo_pago] || 0) + 1;
  });
  const dataMetodoPago = Object.entries(metodoPagoMap).map(([name, value]) => ({
    name: name.charAt(0).toUpperCase() + name.slice(1), value,
  }));

  const dataTopModelos = modelosOrdenados.slice(0, 5).map(([name, value]) => ({ name, value }));

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-50">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-500 font-medium">Cargando dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">

      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-extrabold text-gray-800">📊 Dashboard</h1>
        <p className="text-gray-400 mt-1">Resumen general de tu concesionaria</p>
      </div>

      {/* ── KPI fila 1 ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        <KPICard title="Total Ventas" value={totalVentas}
          subtitle="ventas registradas" icon="🛒" color="border-indigo-500" />
        <KPICard title="Ingresos Totales"
          value={`S/ ${totalIngresos.toLocaleString("es-PE")}`}
          subtitle="suma de todas las ventas" icon="💰" color="border-emerald-500" />
        <KPICard title="Tasa de Conversión" value={`${tasaConversion}%`}
          subtitle="del inventario vendido" icon="📈" color="border-amber-500" />
        <KPICard title="Vendedor Estrella" value={vendedorEstrella}
          subtitle="más ventas registradas" icon="🏆" color="border-rose-500" />
      </div>

      {/* ── KPI fila 2 ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        <KPICard title="Compradores" value={compradores.length}
          subtitle="compradores registrados" icon="👤" color="border-blue-500" />
        <KPICard title="Descuentos Totales"
          value={`S/ ${totalDescuentos.toLocaleString("es-PE")}`}
          subtitle="descuentos aplicados" icon="🏷️" color="border-purple-500" />
        <KPICard title="Comisiones Totales"
          value={`S/ ${totalComisiones.toLocaleString("es-PE")}`}
          subtitle="comisiones a vendedores" icon="💼" color="border-orange-500" />
        <KPICard title="Autos en Inventario" value={autos.length}
          subtitle={`${autosDisponibles} disponibles`} icon="🚗" color="border-teal-500" />
      </div>

      {/* ── KPI fila 3 ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-10">
        <KPICard title="Modelo más vendido" value={autoMasVendido.split(" (")[0]}
          subtitle={`${autoMasVendido.split("(")[1]?.replace(")", "") || 0} unidades vendidas`}
          icon="🥇" color="border-emerald-400" />
        <KPICard title="Modelo menos vendido" value={autoMenosVendido.split(" (")[0]}
          subtitle={`${autoMenosVendido.split("(")[1]?.replace(")", "") || 0} unidades vendidas`}
          icon="📉" color="border-gray-300" />
      </div>

      {/* ── Gráficas fila 1 ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <div className="bg-white rounded-2xl shadow p-6 hover:shadow-xl transition-all duration-300">
          <h2 className="text-lg font-bold text-gray-700 mb-4">🧑‍💼 Autos vendidos por vendedor</h2>
          {dataBarras.every((d) => d.ventas === 0) ? (
            <p className="text-gray-400 text-center py-10">Sin ventas registradas aún</p>
          ) : (
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={dataBarras} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="nombre" tick={{ fontSize: 12 }} />
                <YAxis allowDecimals={false} tick={{ fontSize: 12 }} />
                <Tooltip
                  contentStyle={{ borderRadius: "12px", border: "none", boxShadow: "0 4px 20px rgba(0,0,0,0.1)" }}
                  formatter={(value, name) => [
                    name === "ventas" ? value : `S/ ${value.toLocaleString("es-PE")}`,
                    name === "ventas" ? "Ventas" : "Ingresos",
                  ]}
                />
                <Bar dataKey="ventas" fill="#6366f1" radius={[8, 8, 0, 0]} name="ventas" />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>

        <div className="bg-white rounded-2xl shadow p-6 hover:shadow-xl transition-all duration-300">
          <h2 className="text-lg font-bold text-gray-700 mb-4">🚗 Estado del inventario</h2>
          {dataDona.length === 0 ? (
            <p className="text-gray-400 text-center py-10">Sin autos registrados aún</p>
          ) : (
            <>
              <ResponsiveContainer width="100%" height={220}>
                <PieChart>
                  <Pie data={dataDona} cx="50%" cy="50%"
                    innerRadius={65} outerRadius={100} paddingAngle={4} dataKey="value">
                    {dataDona.map((_, index) => (
                      <Cell key={index} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ borderRadius: "12px", border: "none" }} />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
              <div className="flex justify-center gap-6 mt-2">
                <div className="text-center">
                  <p className="text-2xl font-bold text-indigo-500">{autosDisponibles}</p>
                  <p className="text-gray-400 text-xs">Disponibles</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-amber-500">{autosReservados}</p>
                  <p className="text-gray-400 text-xs">Reservados</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-rose-500">{autosVendidos}</p>
                  <p className="text-gray-400 text-xs">Vendidos</p>
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      {/* ── Gráfica ventas por mes con selector de año ── */}
      <GraficaVentasPorMes ventas={ventas} />

      {/* ── Gráficas fila 3 ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <div className="bg-white rounded-2xl shadow p-6 hover:shadow-xl transition-all duration-300">
          <h2 className="text-lg font-bold text-gray-700 mb-4">🥇 Top 5 modelos más vendidos</h2>
          {dataTopModelos.length === 0 ? (
            <p className="text-gray-400 text-center py-10">Sin datos aún</p>
          ) : (
            <ResponsiveContainer width="100%" height={230}>
              <BarChart data={dataTopModelos} layout="vertical"
                margin={{ top: 5, right: 30, left: 10, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis type="number" allowDecimals={false} tick={{ fontSize: 11 }} />
                <YAxis type="category" dataKey="name" tick={{ fontSize: 11 }} width={100} />
                <Tooltip contentStyle={{ borderRadius: "12px", border: "none" }} />
                <Bar dataKey="value" radius={[0, 8, 8, 0]} name="Vendidos">
                  {dataTopModelos.map((_, index) => (
                    <Cell key={index} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>

        <div className="grid grid-rows-2 gap-6">
          <div className="bg-white rounded-2xl shadow p-6 hover:shadow-xl transition-all duration-300">
            <h2 className="text-lg font-bold text-gray-700 mb-3">⛽ Inventario por combustible</h2>
            {dataCombustible.length === 0 ? (
              <p className="text-gray-400 text-center py-4">Sin datos</p>
            ) : (
              <ResponsiveContainer width="100%" height={90}>
                <BarChart data={dataCombustible} margin={{ top: 0, right: 10, left: -20, bottom: 0 }}>
                  <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                  <YAxis allowDecimals={false} tick={{ fontSize: 11 }} />
                  <Tooltip contentStyle={{ borderRadius: "12px", border: "none" }} />
                  <Bar dataKey="value" radius={[6, 6, 0, 0]} name="Autos">
                    {dataCombustible.map((_, index) => (
                      <Cell key={index} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>

          <div className="bg-white rounded-2xl shadow p-6 hover:shadow-xl transition-all duration-300">
            <h2 className="text-lg font-bold text-gray-700 mb-3">💳 Métodos de pago</h2>
            {dataMetodoPago.length === 0 ? (
              <p className="text-gray-400 text-center py-4">Sin datos</p>
            ) : (
              <div className="flex items-center gap-4">
                <ResponsiveContainer width="60%" height={90}>
                  <PieChart>
                    <Pie data={dataMetodoPago} cx="50%" cy="50%"
                      innerRadius={25} outerRadius={42} paddingAngle={3} dataKey="value">
                      {dataMetodoPago.map((_, index) => (
                        <Cell key={index} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip contentStyle={{ borderRadius: "12px", border: "none" }} />
                  </PieChart>
                </ResponsiveContainer>
                <div className="flex flex-col gap-1 text-xs">
                  {dataMetodoPago.map((item, index) => (
                    <div key={item.name} className="flex items-center gap-2">
                      <span className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: COLORS[index % COLORS.length] }} />
                      <span className="text-gray-600">{item.name}: <strong>{item.value}</strong></span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── Tabla ranking vendedores ── */}
      <div className="bg-white rounded-2xl shadow p-6 hover:shadow-xl transition-all duration-300 mb-6">
        <h2 className="text-lg font-bold text-gray-700 mb-4">🏅 Ranking de vendedores</h2>
        {vendedores.length === 0 ? (
          <p className="text-gray-400 text-center py-6">Sin vendedores registrados</p>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-gray-400 border-b text-xs uppercase">
                <th className="pb-3">#</th>
                <th className="pb-3">Vendedor</th>
                <th className="pb-3">Email</th>
                <th className="pb-3 text-center">Ventas</th>
                <th className="pb-3 text-right">Ingresos</th>
                <th className="pb-3 text-right">Comisión</th>
              </tr>
            </thead>
            <tbody>
              {vendedores
                .map((v) => ({
                  ...v,
                  totalVentas: ventasPorVendedorMap[v.id] || 0,
                  ingresos: ventas.filter((venta) => venta.vendedor === v.id)
                    .reduce((acc, venta) => acc + parseFloat(venta.total || 0), 0),
                  comision: ventas.filter((venta) => venta.vendedor === v.id)
                    .reduce((acc, venta) => acc + parseFloat(venta.comision_vendedor || 0), 0),
                }))
                .sort((a, b) => b.totalVentas - a.totalVentas)
                .map((v, i) => (
                  <tr key={v.id} className="border-b last:border-0 hover:bg-gray-50 transition">
                    <td className="py-3 font-bold text-gray-300">{i + 1}</td>
                    <td className="py-3">
                      <div className="flex items-center gap-2">
                        <span className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center font-bold text-xs">
                          {v.nombre[0].toUpperCase()}
                        </span>
                        <span className="font-semibold text-gray-700">{v.nombre}</span>
                        {i === 0 && v.totalVentas > 0 && (
                          <span className="text-xs bg-amber-100 text-amber-600 px-2 py-0.5 rounded-full font-semibold">⭐ Top</span>
                        )}
                      </div>
                    </td>
                    <td className="py-3 text-gray-400">{v.email}</td>
                    <td className="py-3 text-center">
                      <span className="bg-indigo-100 text-indigo-600 font-bold px-3 py-1 rounded-full text-xs">
                        {v.totalVentas}
                      </span>
                    </td>
                    <td className="py-3 text-right font-semibold text-emerald-600">
                      S/ {v.ingresos.toLocaleString("es-PE")}
                    </td>
                    <td className="py-3 text-right font-semibold text-purple-500">
                      S/ {v.comision.toLocaleString("es-PE")}
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        )}
      </div>

      {/* ── Tabla últimas ventas ── */}
      <div className="bg-white rounded-2xl shadow p-6 hover:shadow-xl transition-all duration-300">
        <h2 className="text-lg font-bold text-gray-700 mb-4">🕐 Últimas ventas</h2>
        {ventas.length === 0 ? (
          <p className="text-gray-400 text-center py-6">Sin ventas registradas</p>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-gray-400 border-b text-xs uppercase">
                <th className="pb-3">ID</th>
                <th className="pb-3">Fecha</th>
                <th className="pb-3">Vendedor</th>
                <th className="pb-3">Método pago</th>
                <th className="pb-3 text-center">Cuotas</th>
                <th className="pb-3 text-right">Descuento</th>
                <th className="pb-3 text-right">Total</th>
              </tr>
            </thead>
            <tbody>
              {[...ventas]
                .sort((a, b) => new Date(b.fecha) - new Date(a.fecha))
                .slice(0, 8)
                .map((v) => {
                  const vendedor = vendedores.find((ve) => ve.id === v.vendedor);
                  return (
                    <tr key={v.id} className="border-b last:border-0 hover:bg-gray-50 transition">
                      <td className="py-3 text-gray-400">#{v.id}</td>
                      <td className="py-3 text-gray-500">{new Date(v.fecha).toLocaleDateString("es-PE")}</td>
                      <td className="py-3 font-semibold text-gray-700">{vendedor?.nombre || "—"}</td>
                      <td className="py-3">
                        <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                          v.metodo_pago === "efectivo" ? "bg-emerald-100 text-emerald-600"
                          : v.metodo_pago === "credito" ? "bg-blue-100 text-blue-600"
                          : "bg-purple-100 text-purple-600"
                        }`}>
                          {v.metodo_pago ? v.metodo_pago.charAt(0).toUpperCase() + v.metodo_pago.slice(1) : "—"}
                        </span>
                      </td>
                      <td className="py-3 text-center text-gray-500">{v.numero_cuotas || 1}</td>
                      <td className="py-3 text-right text-rose-500">
                        {v.descuento && parseFloat(v.descuento) > 0
                          ? `- S/ ${parseFloat(v.descuento).toLocaleString("es-PE")}` : "—"}
                      </td>
                      <td className="py-3 text-right font-bold text-gray-700">
                        S/ {parseFloat(v.total).toLocaleString("es-PE")}
                      </td>
                    </tr>
                  );
                })}
            </tbody>
          </table>
        )}
      </div>

    </div>
  );
};

export default Dashboard;