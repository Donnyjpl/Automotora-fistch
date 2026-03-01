import api from "./api";

// Compradores
export const getCompradores = () => api.get("compradores/");
export const getCompradorById = (id) => api.get(`compradores/${id}/`);
export const createComprador = (data) => api.post("compradores/", data);
export const updateComprador = (id, data) => api.put(`compradores/${id}/`, data);
export const deleteComprador = (id) => api.delete(`compradores/${id}/`);
export const getHistorialComprador = (id) => api.get(`compradores/${id}/historial/`);

