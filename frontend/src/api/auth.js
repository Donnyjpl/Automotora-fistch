// ✅ Cambia localhost por ngrok
const API_URL = "https://5387-2803-c600-d20b-88fe-e09e-3fae-40c-6996.ngrok-free.app/api/";

export const login = async (username, password) => {
  const res = await fetch(`${API_URL}token/`, {
    method: "POST",
    headers: { 
      "Content-Type": "application/json",
      "ngrok-skip-browser-warning": "true"  // ✅ agrega esto
    },
    body: JSON.stringify({ username, password }),
  });
  if (!res.ok) throw new Error("Usuario o contraseña incorrecta");
  const data = await res.json();
  localStorage.setItem("access_token", data.access);
  localStorage.setItem("refresh_token", data.refresh);
  localStorage.setItem("username", username);
  localStorage.setItem("role", data.role);
  return data;
};

export const logout = () => {
  localStorage.removeItem("access_token");
  localStorage.removeItem("refresh_token");
  localStorage.removeItem("role");
};

export const getAccessToken = () => localStorage.getItem("access_token");
export const getRole = () => localStorage.getItem("role");
export const isAuthenticated = () => !!getAccessToken();