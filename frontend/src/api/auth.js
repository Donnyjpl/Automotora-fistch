// ✅ Cambia localhost por ngrok
const API_URL = "http://localhost:8000/api/";  // ✅ sin ngrok

export const login = async (username, password) => {
  const res = await fetch(`${API_URL}token/`, {
    method: "POST",
    headers: { 
      "Content-Type": "application/json",
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

// ─── RECUPERACIÓN DE CONTRASEÑA ──────────────────────────────────────────────

export const requestPasswordReset = async (email) => {
  const res = await fetch(`${API_URL}auth/request-reset/`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email }),
  });
  if (!res.ok) throw new Error("Error al enviar el correo");
};

export const confirmPasswordReset = async (token, password) => {
  const res = await fetch(`${API_URL}auth/confirm-reset/`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ token, password }),
  });
  if (!res.ok) {
    const data = await res.json();
    throw new Error(data.error || "Error al restablecer la contraseña");
  }
};