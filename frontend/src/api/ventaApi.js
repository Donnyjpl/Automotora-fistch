
// Ventas

import api from "./api";
export const getVentas = () => api.get("ventas/");
export const createVenta = (data) => api.post("ventas/", data);
export const updateVenta = (id, data) => api.put(`ventas/${id}/`, data);
export const deleteVenta = (id) => api.delete(`ventas/${id}/`);
export const getEstadisticasVentas = () => api.get("ventas/estadisticas/");