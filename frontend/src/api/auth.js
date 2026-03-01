const API_URL = "http://localhost:8000/api/";

export const login = async (username, password) => {
  const res = await fetch(`${API_URL}token/`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username, password }),
  });
  if (!res.ok) throw new Error("Usuario o contraseña incorrecta");
  const data = await res.json();
  localStorage.setItem("access_token", data.access);
  localStorage.setItem("refresh_token", data.refresh);
  localStorage.setItem("username", username); // 👈 guardamos usuario
  localStorage.setItem("role", data.role);
  // opcional: si devuelves rol desde Django
  // localStorage.setItem("role", data.role);
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