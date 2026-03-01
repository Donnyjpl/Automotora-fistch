import { useState, useMemo } from "react";
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Legend,
} from "recharts";

const meses = ["Ene","Feb","Mar","Abr","May","Jun","Jul","Ago","Sep","Oct","Nov","Dic"];

const GraficaVentasPorMes = ({ ventas }) => {
  // Obtener años disponibles de las ventas
  const aniosDisponibles = useMemo(() => {
    const set = new Set(ventas.map((v) => new Date(v.fecha).getFullYear()));
    return [...set].sort((a, b) => b - a); // más reciente primero
  }, [ventas]);

  const [anioSeleccionado, setAnioSeleccionado] = useState(
    aniosDisponibles[0] || new Date().getFullYear()
  );
  const [mostrarTodos, setMostrarTodos] = useState(false);

  // Datos filtrados por año seleccionado
  const dataAnio = useMemo(() => {
    const ventasDelAnio = ventas.filter(
      (v) => new Date(v.fecha).getFullYear() === anioSeleccionado
    );
    const map = {};
    ventasDelAnio.forEach((v) => {
      const mes = new Date(v.fecha).getMonth();
      map[mes] = (map[mes] || 0) + 1;
    });

    // Si mostrarTodos: mostrar solo meses que tienen datos o hasta el mes actual
    const mesActual = new Date().getFullYear() === anioSeleccionado
      ? new Date().getMonth()
      : 11;

    return meses.map((nombre, i) => ({
      mes: nombre,
      ventas: map[i] || 0,
      // Ocultar meses futuros del año actual
      activo: i <= mesActual,
    })).filter((d) => mostrarTodos || d.activo);
  }, [ventas, anioSeleccionado, mostrarTodos]);

  // Datos comparativos: todos los años en una sola gráfica
  const dataComparativo = useMemo(() => {
    return meses.map((nombre, i) => {
      const punto = { mes: nombre };
      aniosDisponibles.forEach((anio) => {
        const count = ventas.filter(
          (v) =>
            new Date(v.fecha).getFullYear() === anio &&
            new Date(v.fecha).getMonth() === i
        ).length;
        punto[anio] = count;
      });
      return punto;
    });
  }, [ventas, aniosDisponibles]);

  const coloresAnios = ["#6366f1", "#f43f5e", "#10b981", "#f59e0b", "#3b82f6"];
  const totalDelAnio = dataAnio.reduce((acc, d) => acc + d.ventas, 0);

  return (
    <div className="bg-white rounded-2xl shadow p-6 hover:shadow-xl transition-all duration-300 mb-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
        <div>
          <h2 className="text-lg font-bold text-gray-700">📅 Ventas por mes</h2>
          <p className="text-xs text-gray-400 mt-0.5">
            {mostrarTodos
              ? "Comparando todos los años"
              : `${totalDelAnio} ventas en ${anioSeleccionado}`}
          </p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          {/* Botones de año */}
          {!mostrarTodos && aniosDisponibles.map((anio) => (
            <button
              key={anio}
              onClick={() => setAnioSeleccionado(anio)}
              className={`px-3 py-1 rounded-lg text-sm font-semibold border transition ${
                anioSeleccionado === anio
                  ? "bg-indigo-500 text-white border-indigo-500"
                  : "text-gray-500 border-gray-200 hover:bg-gray-50"
              }`}>
              {anio}
            </button>
          ))}
          {/* Botón comparar */}
          {aniosDisponibles.length > 1 && (
            <button
              onClick={() => setMostrarTodos(!mostrarTodos)}
              className={`px-3 py-1 rounded-lg text-sm font-semibold border transition ${
                mostrarTodos
                  ? "bg-rose-500 text-white border-rose-500"
                  : "text-gray-500 border-gray-200 hover:bg-gray-50"
              }`}>
              {mostrarTodos ? "Ver por año" : "Comparar años"}
            </button>
          )}
        </div>
      </div>

      {/* Gráfica */}
      {ventas.length === 0 ? (
        <p className="text-gray-400 text-center py-10">Sin ventas registradas aún</p>
      ) : (
        <ResponsiveContainer width="100%" height={260}>
          {mostrarTodos ? (
            <LineChart data={dataComparativo} margin={{ top: 5, right: 30, left: 0, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="mes" tick={{ fontSize: 12 }} />
              <YAxis allowDecimals={false} tick={{ fontSize: 12 }} />
              <Tooltip contentStyle={{ borderRadius: "12px", border: "none", boxShadow: "0 4px 20px rgba(0,0,0,0.1)" }} />
              <Legend />
              {aniosDisponibles.map((anio, index) => (
                <Line
                  key={anio}
                  type="monotone"
                  dataKey={anio}
                  stroke={coloresAnios[index % coloresAnios.length]}
                  strokeWidth={2}
                  dot={{ r: 4 }}
                  activeDot={{ r: 7 }}
                />
              ))}
            </LineChart>
          ) : (
            <LineChart data={dataAnio} margin={{ top: 5, right: 30, left: 0, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="mes" tick={{ fontSize: 12 }} />
              <YAxis allowDecimals={false} tick={{ fontSize: 12 }} />
              <Tooltip contentStyle={{ borderRadius: "12px", border: "none", boxShadow: "0 4px 20px rgba(0,0,0,0.1)" }} />
              <Line
                type="monotone"
                dataKey="ventas"
                stroke="#6366f1"
                strokeWidth={3}
                dot={{ r: 5, fill: "#6366f1" }}
                activeDot={{ r: 8 }}
                name="Ventas"
              />
            </LineChart>
          )}
        </ResponsiveContainer>
      )}
    </div>
  );
};

export default GraficaVentasPorMes;