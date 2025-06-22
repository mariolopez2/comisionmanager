import React, { useState } from "react";
import { apiPost, apiPut } from "../api.js";

export default function RoutesTab({ currentUser, routes, setRoutes, operators }) {
    if (currentUser?.rol !== "admin") return null;
    const [form, setForm] = useState({ name: "", operator: "" });
    const [editingId, setEditingId] = useState(null);

    const handleSave = async () => {
      if (!form.name.trim()) return;
      try {
        if (editingId) {
          const updated = await apiPut(`/routes/${editingId}`, form);
          setRoutes(routes.map(r => (r.id === editingId ? updated : r)));
        } else {
          const created = await apiPost('/routes', form);
          setRoutes([...routes, created]);
        }
        setForm({ name: "", operator: "" });
        setEditingId(null);
      } catch (err) {
        alert('Error guardando ruta');
        console.error(err);
      }
    };

    const startEdit = route => {
      setEditingId(route.id);
      setForm({ name: route.name, operator: route.operator });
    };

    return (
      <div className="space-y-6">
        <div className="border p-4 rounded-2xl shadow">
          <h2 className="font-bold text-lg mb-3">Registrar Ruta</h2>
          <div className="grid gap-3 md:grid-cols-2">
            <input placeholder="Nombre de la ruta" className="border p-2 rounded" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} />
            <select className="border p-2 rounded" value={form.operator} onChange={e => setForm({ ...form, operator: e.target.value })}>
              <option value="">-- Selecciona operador --</option>
              {operators.map(op => (
                <option key={op.id} value={`${op.firstName} ${op.lastName}`}>{op.firstName} {op.lastName}</option>
              ))}
            </select>
          </div>
          <button className="mt-4 bg-green-600 text-white px-4 py-2 rounded" onClick={handleSave}>{editingId ? "Actualizar" : "Guardar"}</button>
          {editingId && (
            <button className="ml-2 text-sm text-gray-600 underline" onClick={() => { setForm({ name: "", operator: "" }); setEditingId(null); }}>Cancelar</button>
          )}
        </div>
        <div className="border p-4 rounded-2xl shadow">
          <h2 className="font-bold text-lg mb-3">Rutas registradas</h2>
          {routes.length === 0 && <p className="text-sm italic">No hay rutas aún.</p>}
          <ul className="space-y-2">
            {routes.map(r => (
              <li key={r.id} className="border p-2 rounded flex justify-between items-center">
                <div><strong>{r.name}</strong> <span className="text-sm text-gray-500">(Operador: {r.operator || "N/A"})</span></div>
                <button className="text-blue-600 text-sm" onClick={() => startEdit(r)}>Editar</button>
              </li>
            ))}
          </ul>
        </div>
      </div>
    );
  };
  
  
