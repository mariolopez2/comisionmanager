import React, { useState } from "react";
import { apiPut } from "../api.js";

export default function ConfigTab({ currentUser, operators, setOperators, settings, setSettings }) {
  // Solo admin puede ver
  if (currentUser?.rol !== "admin") return null;
  const [form, setForm] = useState({
    oldpass: "",
    newpass: "",
    emailFrom: settings.emailFrom,
    reportTitle: settings.reportTitle,
  });
  // Cambiar contraseña (de la cuenta logueada)
  async function cambiarPass() {
    if (form.oldpass !== currentUser.password) {
      alert("Contraseña actual incorrecta");
      return;
    }
    try {
      const updated = await apiPut(`/operators/${currentUser.id}`, { ...currentUser, password: form.newpass });
      setOperators(ops => ops.map(op => op.id === currentUser.id ? updated : op));
      alert("Contraseña cambiada");
      setForm({ ...form, oldpass: "", newpass: "" });
    } catch (err) {
      alert('Error cambiando contraseña');
      console.error(err);
    }
  }
  // Cambiar email/titulo
  async function guardarConfig() {
    try {
      const updated = await apiPut('/settings', { emailFrom: form.emailFrom, reportTitle: form.reportTitle });
      setSettings(updated);
      alert("Configuración actualizada");
    } catch (err) {
      alert('Error guardando configuración');
      console.error(err);
    }
  }
  return (
    <div className="space-y-8 max-w-xl">
      <div className="border p-4 rounded-2xl shadow">
        <h3 className="font-bold mb-3">Cambiar contraseña de administrador</h3>
        <input className="border p-2 rounded w-full mb-2" type="password" placeholder="Contraseña actual" value={form.oldpass} onChange={e => setForm(f => ({ ...f, oldpass: e.target.value }))} />
        <input className="border p-2 rounded w-full mb-2" type="password" placeholder="Nueva contraseña" value={form.newpass} onChange={e => setForm(f => ({ ...f, newpass: e.target.value }))} />
        <button className="bg-blue-600 text-white px-4 py-2 rounded" onClick={cambiarPass}>Cambiar contraseña</button>
      </div>
      <div className="border p-4 rounded-2xl shadow">
        <h3 className="font-bold mb-3">Opciones de ticket y reportes</h3>
        <input className="border p-2 rounded w-full mb-2" placeholder="Correo de envío de reportes" value={form.emailFrom} onChange={e => setForm(f => ({ ...f, emailFrom: e.target.value }))} />
        <input className="border p-2 rounded w-full mb-2" placeholder="Título en encabezado del ticket" value={form.reportTitle} onChange={e => setForm(f => ({ ...f, reportTitle: e.target.value }))} />
        <button className="bg-green-600 text-white px-4 py-2 rounded" onClick={guardarConfig}>Guardar configuración</button>
      </div>
    </div>
  );
};

