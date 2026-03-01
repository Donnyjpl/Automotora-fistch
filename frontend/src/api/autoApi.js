import api from "./api";

export const getAutos = () => api.get("autos/");
export const getAutoById = (id) => api.get(`autos/${id}/`);
export const createAuto = (data) => api.post("autos/", data);
export const updateAuto = (id, data) => api.put(`autos/${id}/`, data);
export const deleteAuto = (id) => api.delete(`autos/${id}/`);
export const getEstadisticasAutos = () => api.get("autos/estadisticas/");