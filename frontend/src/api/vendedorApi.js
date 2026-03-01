import api from "./api";

// Vendedores
export const getVendedores = () => api.get("vendedores/");
export const getVendedorById = (id) => api.get(`vendedores/${id}/`);
export const createVendedor = (data) => api.post("vendedores/", data);
export const updateVendedor = (id, data) => api.put(`vendedores/${id}/`, data);
export const deleteVendedor = (id) => api.delete(`vendedores/${id}/`);
