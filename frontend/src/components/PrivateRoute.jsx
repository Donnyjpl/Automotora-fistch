import { Navigate, Outlet } from "react-router-dom";
import { isAuthenticated, getRole } from "../api/auth";
import toast from "react-hot-toast";

const PrivateRoute = ({ role }) => {
  if (!isAuthenticated()) {
    toast.error("Debes iniciar sesión");
    return <Navigate to="/login" replace />;
  }

  if (role && getRole() !== role) {
    toast.error("No tienes autorización para acceder");
    return <Navigate to="/ventas" replace />;
  }

  return <Outlet />;
};

export default PrivateRoute;