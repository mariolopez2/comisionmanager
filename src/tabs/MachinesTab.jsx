import React, { useState } from "react";

export default function MachinesTab({ currentUser, routes, machines, setMachines, clients }) {
  if (currentUser?.rol !== "admin") return null;

  const [form, setForm] = useState({
    numero: "",      // Nuevo campo de identificación visible
    type: "",
    fondo: 500,
    route: "",
    client: "",
    status: "libre",
    active: true,
  });
  const [editingId, setEditingId] = useState(null);
  const [assignMode, setAssignMode] = useState(false);
  const [assignClient, setAssignClient] = useState("");
  // Integrar el state clients real

  // Rutas y clientes activos y válidos
  const rutasDisponibles = routes.map(r => r.name);
  const clientesActivos = clients.filter(c => c.active);

  // Máquina solo puede ser asignada si está libre y activa
  const maquinasLibres = machines.filter(m => m.status === "libre" && m.active);

  const handleSave = () => {
    if (!form.type || !form.numero) return;
    if (editingId) {
      setMachines(machines.map(m =>
        m.id === editingId ? { ...m, ...form } : m
      ));
    } else {
      setMachines([
        ...machines,
        {
          id: crypto.randomUUID(), // ID único invisible
          ...form,
        }
      ]);
    }
    setForm({
      numero: "",
      type: "",
      fondo: 500,
      route: "",
      client: "",
      status: "libre",
      active: true,
    });
    setEditingId(null);
    setAssignMode(false);
    setAssignClient("");
  };

  const startEdit = m => {
    setEditingId(m.id);
    setForm({ ...m });
  };

  // Botón activar/desactivar
  const toggleActive = id => {
    setMachines(machines.map(m =>
      m.id === id ? { ...m, active: !m.active } : m
    ));
  };

  // Botón desasignar
  const desasignar = id => {
    setMachines(machines.map(m =>
      m.id === id ? { ...m, status: "libre", route: "", client: "" } : m
    ));
  };

  // Nuevo: Asignar a cliente activo
  const iniciarAsignacion = id => {
    setEditingId(id);
    setAssignMode(true);
  };
  const asignarMaquina = () => {
    if (!assignClient) return;
    setMachines(machines.map(m =>
      m.id === editingId ? { ...m, client: assignClient, status: "asignada" } : m
    ));
    setEditingId(null);
    setAssignMode(false);
    setAssignClient("");
  };

  return (
    <div className="space-y-6">
      <div className="border p-4 rounded-2xl shadow">
        <h2 className="font-bold text-lg mb-3">{editingId && !assignMode ? "Editar Máquina" : "Registrar Máquina"}</h2>
        <div className="grid gap-3 md:grid-cols-2">
          <input
            className="border p-2 rounded"
            placeholder="Número de máquina"
            value={form.numero}
            onChange={e => setForm({ ...form, numero: e.target.value })}
            disabled={assignMode}
          />
          <input
            className="border p-2 rounded"
            placeholder="Tipo de máquina"
            value={form.type}
            onChange={e => setForm({ ...form, type: e.target.value })}
            disabled={assignMode}
          />
          <input
            className="border p-2 rounded"
            type="number"
            min={0}
            placeholder="Fondo"
            value={form.fondo}
            onChange={e => setForm({ ...form, fondo: e.target.value })}
            disabled={assignMode}
          />
          <select
            className="border p-2 rounded"
            value={form.route}
            onChange={e => setForm({ ...form, route: e.target.value })}
            disabled={form.status !== "libre" || assignMode}
          >
            <option value="">-- Ruta --</option>
            {rutasDisponibles.map(r => (
              <option key={r} value={r}>{r}</option>
            ))}
          </select>
        </div>
        <div className="flex gap-2 mt-4">
          <button className="bg-green-600 text-white px-4 py-2 rounded" onClick={handleSave} disabled={assignMode}>
            {editingId && !assignMode ? "Actualizar" : "Guardar"}
          </button>
          {editingId && !assignMode && (
            <button className="text-sm underline" onClick={() => { setEditingId(null); setForm({ numero: "", type: "", fondo: 500, route: "", client: "", status: "libre", active: true }); }}>Cancelar</button>
          )}
        </div>
        {/* Asignación de máquina a cliente */}
        {editingId && assignMode && (
          <div className="mt-6">
            <h3 className="font-bold mb-2">Asignar máquina a cliente</h3>
            <select className="border p-2 rounded" value={assignClient} onChange={e => setAssignClient(e.target.value)}>
              <option value="">-- Selecciona cliente --</option>
              {clientesActivos.map(c => (
                <option key={c.id} value={c.id}>{c.firstName} {c.lastName} - Ruta: {c.route}</option>
              ))}
            </select>
            <button className="ml-2 bg-blue-600 text-white px-4 py-2 rounded" onClick={asignarMaquina}>Asignar</button>
            <button className="ml-2 text-sm underline" onClick={() => { setEditingId(null); setAssignMode(false); setAssignClient(""); }}>Cancelar</button>
          </div>
        )}
      </div>
      <div className="border p-4 rounded-2xl shadow">
        <h2 className="font-bold text-lg mb-3">Máquinas Registradas</h2>
        {machines.length === 0 && <p className="text-sm italic">No hay máquinas aún.</p>}
        <ul className="space-y-2 text-sm">
          {machines.map(m => (
            <li key={m.id} className="border p-2 rounded flex flex-col md:flex-row justify-between md:items-center gap-2">
              <div>
                <b>#{m.numero}</b> – {m.type} — Fondo: <span className="text-gray-700">${m.fondo}</span> —
                Estado: <span className={m.active ? "text-green-600" : "text-red-500"}>
                  {m.active ? "Activa" : "Inactiva"}
                </span>
                <span className="ml-2 text-xs text-gray-500">
                  {m.status === "asignada" && m.client && (
                    <>[Asignada a cliente: <b>{clientesActivos.find(c => c.id === m.client)?.firstName} {clientesActivos.find(c => c.id === m.client)?.lastName}</b>]</>
                  )}
                  {m.status === "libre" && <>[Libre]</>}
                </span>
              </div>
              <div className="flex gap-2">
                <button className="text-blue-600 text-sm" onClick={() => startEdit(m)} disabled={assignMode}>Editar</button>
                <button className="text-yellow-600 text-sm" onClick={() => toggleActive(m.id)} disabled={assignMode}>
                  {m.active ? "Desactivar" : "Activar"}
                </button>
                {m.status === "asignada" && (
                  <button className="text-red-600 text-sm" onClick={() => desasignar(m.id)} disabled={assignMode}>Desasignar</button>
                )}
                {m.status === "libre" && (
                  <button className="text-purple-600 text-sm" onClick={() => iniciarAsignacion(m.id)} disabled={assignMode}>Asignar a cliente</button>
                )}
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};
  

