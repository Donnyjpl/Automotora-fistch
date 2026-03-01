import { useState, useEffect } from "react";

const VendedorForm = ({ onSubmit, vendedorSeleccionado }) => {
  const [formData, setFormData] = useState({
    nombre: "",
    email: "",
    telefono: "",
  });

  useEffect(() => {
    if (vendedorSeleccionado) {
      setFormData(vendedorSeleccionado);
    } else {
      setFormData({ nombre: "", email: "", telefono: "" });
    }
  }, [vendedorSeleccionado]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
    if (!vendedorSeleccionado) {
      setFormData({ nombre: "", email: "", telefono: "" });
    }
  };

  return (
    <form onSubmit={handleSubmit} style={{ marginBottom: "20px" }}>
      <input
        type="text"
        name="nombre"
        placeholder="Nombre"
        value={formData.nombre}
        onChange={handleChange}
        required
      />
      <input
        type="email"
        name="email"
        placeholder="Email"
        value={formData.email}
        onChange={handleChange}
        required
      />
      <input
        type="text"
        name="telefono"
        placeholder="Teléfono"
        value={formData.telefono}
        onChange={handleChange}
        required
      />
      <button type="submit">
        {vendedorSeleccionado ? "Actualizar" : "Crear"}
      </button>
    </form>
  );
};

export default VendedorForm;