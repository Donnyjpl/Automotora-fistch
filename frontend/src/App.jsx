import { BrowserRouter as Router, Routes, Route, NavLink, useLocation } from "react-router-dom";
import { useState, useEffect } from "react";
import { Toaster } from "react-hot-toast";
import PrivateRoute from "./components/PrivateRoute";
import { getRole } from "./api/auth";

import Dashboard from "./pages/Dashboard";
import VendedoresPage from "./pages/VendedoresPage";
import AutosPage from "./pages/AutosPage";
import VentasPage from "./pages/VentasPage";
import CompradorPage from "./pages/CompradorPage";
import LoginPage from "./pages/LoginPage";

const NAV_ITEMS = [
  { to: "/", label: "Dashboard", emoji: "📊", adminOnly: true },
  { to: "/vendedores", label: "Vendedores", emoji: "👤" },
  { to: "/autos", label: "Autos", emoji: "🚗" },
  { to: "/ventas", label: "Ventas", emoji: "💰" },
  { to: "/compradores", label: "Compradores", emoji: "👥" },
];

const Sidebar = ({ open, onClose }) => {
  const role = getRole();
  const username = localStorage.getItem("username") || "Usuario";
  const initial = username[0].toUpperCase();
  const visibleItems = NAV_ITEMS.filter((item) => !item.adminOnly || role === "Admin");

  return (
    <>
      {/* Overlay oscuro en móvil */}
      {open && (
        <div
          className="fixed inset-0 bg-black/60 z-20 md:hidden"
          onClick={onClose}
        />
      )}

      <aside
        className={`
          fixed top-0 left-0 h-full w-64 bg-gray-950 flex flex-col border-r border-orange-900/20 z-30
          transform transition-transform duration-300 ease-in-out
          ${open ? "translate-x-0" : "-translate-x-full"}
          md:relative md:translate-x-0 md:flex
        `}
      >
        {/* Logo */}
        <div className="px-6 py-7 border-b border-white/5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-orange-500 to-orange-700 flex items-center justify-center text-xl shadow-lg shadow-orange-900/40">
              🚗
            </div>
            <div>
              <p className="text-white/50 text-xs tracking-widest uppercase font-mono">Automotora</p>
              <p className="text-orange-400 font-bold text-lg tracking-wider leading-none">FITSCH</p>
            </div>
          </div>
        </div>

        {/* Usuario */}
        <div className="mx-4 mt-5 mb-2 bg-white/5 rounded-xl p-3 border border-white/5 flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-orange-500 to-orange-800 flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
            {initial}
          </div>
          <div className="overflow-hidden">
            <p className="text-white text-sm font-semibold truncate">{username}</p>
            <p className={`text-xs font-mono tracking-widest uppercase ${role === "Admin" ? "text-orange-400" : "text-white/30"}`}>
              {role === "Admin" ? "● Admin" : "● Usuario"}
            </p>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-2">
          <p className="text-white/20 text-xs tracking-widest uppercase font-mono px-3 py-3">Menú</p>
          {visibleItems.map(({ to, label, emoji }) => (
            <NavLink
              key={to}
              to={to}
              end={to === "/"}
              onClick={onClose}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-xl mb-1 text-sm font-medium transition-all duration-200 border-l-2 ${
                  isActive
                    ? "bg-orange-500/15 text-white border-orange-500"
                    : "text-white/40 hover:text-white/80 hover:bg-white/5 border-transparent"
                }`
              }
            >
              <span className="text-base">{emoji}</span>
              <span>{label}</span>
            </NavLink>
          ))}
        </nav>

        {/* Logout */}
        <div className="p-4 border-t border-white/5">
          <button
            onClick={() => {
              localStorage.clear();
              window.location.href = "/login";
            }}
            className="w-full py-2.5 px-4 rounded-xl text-xs font-semibold font-mono tracking-widest uppercase text-red-400 bg-red-500/10 border border-red-500/20 hover:bg-red-500/20 hover:border-red-500/40 transition-all duration-200"
          >
            ⎋ Cerrar sesión
          </button>
        </div>
      </aside>
    </>
  );
};

const TopBar = ({ onMenuClick }) => {
  const location = useLocation();
  if (location.pathname === "/login") return null;

  const pageNames = {
    "/": "Dashboard",
    "/vendedores": "Vendedores",
    "/autos": "Autos",
    "/ventas": "Ventas",
    "/compradores": "Compradores",
  };

  const current = pageNames[location.pathname] || "";
  const today = new Date().toLocaleDateString("es-CL", {
    weekday: "long", year: "numeric", month: "long", day: "numeric",
  });

  return (
    <div className="sticky top-0 z-10 bg-white/80 backdrop-blur-md border-b border-gray-200 px-4 md:px-8 py-4 flex justify-between items-center">
      <div className="flex items-center gap-3">
        {/* Botón hamburguesa solo en móvil */}
        <button
          onClick={onMenuClick}
          className="md:hidden flex flex-col gap-1.5 p-2 rounded-lg hover:bg-gray-100 transition-colors"
          aria-label="Abrir menú"
        >
          <span className="w-5 h-0.5 bg-gray-700 rounded" />
          <span className="w-5 h-0.5 bg-gray-700 rounded" />
          <span className="w-5 h-0.5 bg-gray-700 rounded" />
        </button>
        <div>
          <p className="text-xs text-gray-400 font-mono tracking-widest uppercase mb-0.5">
            Fitsch / {current}
          </p>
          <h1 className="text-xl md:text-2xl font-bold text-gray-900">{current}</h1>
        </div>
      </div>
      <p className="text-xs text-gray-400 font-mono capitalize hidden sm:block">{today}</p>
    </div>
  );
};

const Layout = ({ children }) => {
  const location = useLocation();
  const isLogin = location.pathname === "/login";
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Cierra sidebar al cambiar de ruta
  useEffect(() => {
    setSidebarOpen(false);
  }, [location.pathname]);

  if (isLogin) {
    return (
      <div className="min-h-screen bg-gray-100">
        {children}
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 flex">
      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <main className="flex-1 flex flex-col overflow-auto min-w-0">
        <TopBar onMenuClick={() => setSidebarOpen(true)} />
        <div className="p-4 md:p-8 flex-1">{children}</div>
      </main>
    </div>
  );
};

const App = () => {
  return (
    <Router>
      <Toaster
        position="top-right"
        toastOptions={{
          className: "!bg-gray-900 !text-white !border !border-orange-500/30 !rounded-xl !font-mono !text-sm",
        }}
      />
      <Layout>
        <Routes>
          <Route path="/login" element={<LoginPage />} />

          {/* Dashboard solo Admin */}
          <Route element={<PrivateRoute role="Admin" />}>
            <Route path="/" element={<Dashboard />} />
          </Route>

          {/* Rutas protegidas generales */}
          <Route element={<PrivateRoute />}>
            <Route path="/vendedores" element={<VendedoresPage />} />
            <Route path="/autos" element={<AutosPage />} />
            <Route path="/ventas" element={<VentasPage />} />
            <Route path="/compradores" element={<CompradorPage />} />
          </Route>
        </Routes>
      </Layout>
    </Router>
  );
};

export default App;