import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { login } from "../api/auth";
import toast from "react-hot-toast";

const LoginPage = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      await login(username, password);
      toast.success("¡Login exitoso!");
      navigate("/");
    } catch (err) {
      toast.error("Usuario o contraseña incorrecta");
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-100 px-4">
      <form onSubmit={handleLogin} className="bg-white p-6 sm:p-8 rounded shadow w-full max-w-sm">
        <h2 className="text-2xl font-bold mb-6 text-center">Login</h2>
        <input
          type="text"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          placeholder="Usuario"
          className="w-full p-2 mb-4 border rounded"
        />
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Contraseña"
          className="w-full p-2 mb-6 border rounded"
        />
        <button type="submit" className="w-full bg-blue-500 text-white p-2 rounded">
          Ingresar
        </button>
      </form>
    </div>
  );
};

export default LoginPage;