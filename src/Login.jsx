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
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-zinc-950 via-zinc-900 to-zinc-800 text-white">
      <div className="bg-zinc-900/80 backdrop-blur-xl p-10 rounded-3xl shadow-2xl w-full max-w-sm border border-zinc-700">
        <div className="flex justify-center mb-6">
          <span className="text-5xl">📊</span>
        </div>
        <h1 className="text-3xl font-extrabold mb-6 text-center tracking-tight">Comisión Manager</h1>
        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            className="bg-zinc-800/70 border-zinc-700 border p-3 rounded-xl w-full text-white placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-emerald-600"
            placeholder="Usuario"
            value={username}
            onChange={e => setUsername(e.target.value)}
          />
          <input
            className="bg-zinc-800/70 border-zinc-700 border p-3 rounded-xl w-full text-white placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-emerald-600"
            type="password"
            placeholder="Contraseña"
            value={password}
            onChange={e => setPassword(e.target.value)}
          />
          <button
            type="submit"
            className="w-full bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800 text-white py-3 rounded-xl font-semibold transition shadow-md"
          >
            Iniciar sesión
          </button>
        </form>
        <p className="text-center text-xs text-zinc-400 mt-6 tracking-tight">Versión Alfa 1.0</p>
      </div>
    </div>
  );
}
