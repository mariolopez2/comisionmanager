import React, { useState } from "react";

export default function ClientsTab({ currentUser, clients, setClients, routes }) {
  if (currentUser?.rol !== "admin") return null;

  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    address: "",
    phone: "",
    email: "",
    commission: 40,
    route: "",
    active: true,
  });
  const [editingId, setEditingId] = useState(null);

  // Solo rutas activas
  const rutasDisponibles = routes.map(r => r.name);

  const handleSave = () => {
    if (!form.firstName || !form.lastName || !form.route) return;
    if (editingId) {
      setClients(clients.map(c =>
        c.id === editingId ? { ...c, ...form } : c
      ));
      setEditingId(null);
    } else {
      setClients([
        ...clients,
        {
          id: crypto.randomUUID(),
          ...form,
        }
      ]);
    }
    setForm({
      firstName: "",
      lastName: "",
      address: "",
      phone: "",
      email: "",
      commission: 40,
      route: "",
      active: true,
    });
  };

  const startEdit = c => {
    setEditingId(c.id);
    setForm({ ...c });
  };

  const toggleActive = id => {
    setClients(clients.map(c =>
      c.id === id ? { ...c, active: !c.active } : c
    ));
  };

  return (
    <div className="space-y-8 py-8">
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl shadow-2xl p-8 max-w-lg mx-auto">
        <h2 className="text-2xl font-bold mb-6 tracking-tight text-white">Registrar Cliente</h2>
        <form className="grid gap-6">
          {/* Floating label input */}
          {[
            { id: "firstName", label: "Nombre", type: "text" },
            { id: "lastName", label: "Apellido", type: "text" },
            { id: "address", label: "Dirección Postal", type: "text" },
            { id: "phone", label: "Teléfono", type: "text" },
            { id: "email", label: "Correo electrónico", type: "email" }
          ].map(f => (
            <div className="relative" key={f.id}>
              <input
                id={f.id}
                type={f.type}
                value={form[f.id]}
                onChange={e => setForm({ ...form, [f.id]: e.target.value })}
                className="peer bg-zinc-800 border-b-2 border-zinc-700 focus:border-emerald-500 text-white w-full px-4 pt-6 pb-2 rounded-t-xl focus:outline-none transition-all"
                placeholder=" "
                autoComplete="off"
              />
              <label htmlFor={f.id} className="absolute left-4 top-4 text-zinc-400 text-base pointer-events-none transition-all duration-200
                peer-placeholder-shown:top-4 peer-placeholder-shown:text-base peer-focus:top-1 peer-focus:text-xs peer-focus:text-emerald-400">
                {f.label}
              </label>
            </div>
          ))}

          <div className="flex gap-4">
            <div className="relative w-1/2">
              <input
                type="number"
                min={0}
                max={100}
                id="commission"
                value={form.commission}
                onChange={e => setForm({ ...form, commission: e.target.value })}
                className="peer bg-zinc-800 border-b-2 border-zinc-700 focus:border-emerald-500 text-white w-full px-4 pt-6 pb-2 rounded-t-xl focus:outline-none transition-all"
                placeholder=" "
              />
              <label htmlFor="commission" className="absolute left-4 top-4 text-zinc-400 text-base pointer-events-none transition-all duration-200
                peer-placeholder-shown:top-4 peer-placeholder-shown:text-base peer-focus:top-1 peer-focus:text-xs peer-focus:text-emerald-400">
                Comisión (%)
              </label>
            </div>
            <div className="relative w-1/2">
              <select
                id="route"
                value={form.route}
                onChange={e => setForm({ ...form, route: e.target.value })}
                className="peer bg-zinc-800 border-b-2 border-zinc-700 focus:border-emerald-500 text-white w-full px-4 pt-6 pb-2 rounded-t-xl focus:outline-none transition-all"
              >
                <option value="">-- Ruta --</option>
                {rutasDisponibles.map(r => (
                  <option key={r} value={r}>{r}</option>
                ))}
              </select>
              <label htmlFor="route" className="absolute left-4 top-4 text-zinc-400 text-base pointer-events-none transition-all duration-200
                peer-focus:top-1 peer-focus:text-xs peer-focus:text-emerald-400">
                Ruta
              </label>
            </div>
          </div>
          <button type="button" className="mt-2 w-full bg-emerald-500 hover:bg-emerald-600 text-white font-bold py-3 rounded-xl shadow-xl transition-all" onClick={handleSave}>
            {editingId ? "Actualizar" : "Guardar"}
          </button>
        </form>
      </div>
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl shadow-2xl p-8 max-w-lg mx-auto">
        <h2 className="text-2xl font-bold mb-6 tracking-tight text-white">Clientes Registrados</h2>
        {clients.length === 0 && <p className="text-zinc-400">No hay clientes aún.</p>}
        <ul className="space-y-2 text-sm">
          {clients.map(c => (
            <li key={c.id} className="border-b border-zinc-800 py-3 flex flex-col md:flex-row md:items-center md:justify-between gap-2">
              <div>
                <b>{c.firstName} {c.lastName}</b> — Ruta: <span className="text-zinc-400">{c.route}</span> — Comisión: <span>{c.commission}%</span>
                <span className="ml-2 text-xs text-zinc-500">{c.active ? "[Activo]" : "[Inactivo]"}</span>
              </div>
              <div className="flex gap-2">
                <button className="text-emerald-400 hover:underline" onClick={() => startEdit(c)}>Editar</button>
                <button className="text-yellow-400 hover:underline" onClick={() => toggleActive(c.id)}>
                  {c.active ? "Desactivar" : "Activar"}
                </button>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};



