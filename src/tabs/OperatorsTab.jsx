import React, { useState } from "react";

export default function OperatorsTab({ currentUser, operators, setOperators }) {
    if (currentUser?.rol !== "admin") return null;

    const [form, setForm] = useState({
      firstName: "",
      lastName: "",
      address: "",
      email: "",
      username: "",
      password: "",
      rol: "operator",
    });
    const [editing, setEditing] = useState(null);

    const handleSave = () => {
      if (!form.username || (!form.password && !editing)) return;
      if (editing) {
        setOperators(operators.map(op => op.id === editing ? { ...op, ...form } : op));
        setEditing(null);
      } else {
        setOperators([...operators, { id: crypto.randomUUID(), ...form }]);
      }
      setForm({ firstName: "", lastName: "", address: "", email: "", username: "", password: "", rol: "operator" });
    };

    const handleEdit = (op) => {
      setForm({ ...op, password: "" });
      setEditing(op.id);
    };

    return (
      <div className="space-y-6">
        <div className="border p-4 rounded-2xl shadow">
          <h2 className="font-bold text-lg mb-3">{editing ? "Editar Operador" : "Crear Operador"}</h2>
          <div className="grid gap-3 md:grid-cols-2">
            <input className="bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 w-full mb-3" placeholder="Nombre" value={form.firstName} onChange={e => setForm({ ...form, firstName: e.target.value })} />
            <input className="border p-2 rounded" placeholder="Apellido" value={form.lastName} onChange={e => setForm({ ...form, lastName: e.target.value })} />
            <input className="border p-2 rounded" placeholder="Dirección Postal" value={form.address} onChange={e => setForm({ ...form, address: e.target.value })} />
            <input className="border p-2 rounded" placeholder="Correo electrónico" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} />
            <input className="border p-2 rounded" placeholder="Usuario" value={form.username} onChange={e => setForm({ ...form, username: e.target.value })} />
            <input className="border p-2 rounded" placeholder="Contraseña" type="password" value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} />
            <select className="border p-2 rounded" value={form.rol} onChange={e => setForm({ ...form, rol: e.target.value })}>
              <option value="operator">Operador</option>
              <option value="admin">Administrador</option>
            </select>
          </div>
          <div className="flex gap-2 mt-4">
            <button className="bg-green-600 text-white px-4 py-2 rounded" onClick={handleSave}>{editing ? "Actualizar" : "Guardar"}</button>
            {editing && (
              <button className="text-sm underline" onClick={() => { setEditing(null); setForm({ firstName: "", lastName: "", address: "", email: "", username: "", password: "", rol: "operator" }); }}>Cancelar</button>
            )}
          </div>
        </div>
        <div className="border p-4 rounded-2xl shadow">
          <h2 className="font-bold text-lg mb-3">Operadores Registrados</h2>
          {operators.length === 0 && <p className="text-sm italic">No hay operadores aún.</p>}
          <ul className="space-y-1 text-sm">
            {operators.map(op => (
              <li key={op.id} className="border p-2 rounded flex justify-between items-center">
                <span>{op.firstName} {op.lastName} — <span className="text-gray-500">{op.username}</span> ({op.rol})</span>
                <button className="text-blue-600 text-sm" onClick={() => handleEdit(op)}>Editar</button>
              </li>
            ))}
          </ul>
        </div>
      </div>
    );
  };

