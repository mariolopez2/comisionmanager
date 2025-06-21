// src/Login.jsx
import React, { useState } from "react";

export default function Login({ onLogin }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    await onLogin(username, password);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-zinc-900 to-zinc-800">
      <div className="bg-zinc-900 p-8 rounded-3xl shadow-2xl w-full max-w-sm border border-zinc-700">
        <div className="flex justify-center mb-4">
          <span className="text-5xl">📊</span>
        </div>
        <h1 className="text-3xl font-extrabold mb-4 text-center tracking-tight">Comisión Manager</h1>
        <form onSubmit={handleSubmit}>
          <input
            className="bg-zinc-800 border-zinc-700 border p-3 rounded-xl w-full mb-3 text-white placeholder:text-zinc-500"
            placeholder="Usuario"
            value={username}
            onChange={e => setUsername(e.target.value)}
          />
          <input
            className="bg-zinc-800 border-zinc-700 border p-3 rounded-xl w-full mb-6 text-white placeholder:text-zinc-500"
            type="password"
            placeholder="Contraseña"
            value={password}
            onChange={e => setPassword(e.target.value)}
          />
          <button
            type="submit"
            className="w-full bg-emerald-500 hover:bg-emerald-600 text-white py-3 rounded-xl font-semibold transition shadow"
          >
            Iniciar sesión
          </button>
        </form>
        <p className="text-center text-xs text-zinc-400 mt-4 tracking-tight">Versión Alfa 1.0</p>
      </div>
    </div>
  );
}
