import React, { useState, useEffect } from "react";

// -- App Principal  --
export default function App() {
  useEffect(() => {
    document.body.style.fontFamily = "'Inter', system-ui, Arial, sans-serif";
    document.body.style.background = "#16181c";
    document.body.style.color = "#fff";
    return () => {
      document.body.style.background = "";
      document.body.style.fontFamily = "";
      document.body.style.color = "";
    };
  }, []);

  // State global
  const [currentUser, setCurrentUser] = useState(null);
  const [tab, setTab] = useState("cut");
  const [routes, setRoutes] = useState([]);
  const [operators, setOperators] = useState([]);
  const [machines, setMachines] = useState([]);
  const [clients, setClients] = useState([]);
  const [cuts, setCuts] = useState([]);
  const [settings, setSettings] = useState({
    emailFrom: "",
    reportTitle: "Comisión Manager",
  });

  // Tabs config
  const TABS_ADMIN = [
    { key: "cut", label: "Registrar Corte", icon: "🔄" },
    { key: "operators", label: "Operadores", icon: "👤" },
    { key: "machines", label: "Máquinas", icon: "🎰" },
    { key: "routes", label: "Rutas", icon: "🗺️" },
    { key: "clients", label: "Clientes", icon: "🤝" },
    { key: "reports", label: "Reportes", icon: "📄" },
    { key: "config", label: "Configuración", icon: "⚙️" },
  ];
  const TABS_OPERATOR = [
    { key: "cut", label: "Registrar Corte", icon: "🔄" },
    { key: "reports", label: "Reportes", icon: "📄" },
  ];
  const tabs = currentUser?.rol === "admin" ? TABS_ADMIN : TABS_OPERATOR;

  // Login
  const login = async (username, password) => {
    try {
      const res = await fetch("https://comisionmanager-api.onrender.com/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password })
      });
      const data = await res.json();
      if (res.ok && data.user) {
        // Login exitoso
        setCurrentUser(data.user);
        setTab(data.user.rol === "admin" ? "cut" : "cut");
      } else {
        alert(data.message || "Credenciales incorrectas");
      }
    } catch (err) {
      alert("Error de red");
      console.error(err);
    }
  };

  // TabBar
  const TabBar = () => (
    <nav className="fixed bottom-0 left-0 right-0 z-30 bg-zinc-900 border-t border-zinc-800 flex justify-around items-center py-2 md:static md:bg-transparent md:border-0 md:mb-6 md:rounded-b-2xl md:shadow-xl">
      {tabs.map((t) => (
        <button
          key={t.key}
          onClick={() => setTab(t.key)}
          className={`flex flex-col items-center px-2 pt-1 md:px-4 md:py-2 rounded-xl text-sm font-semibold transition-all duration-150
            ${tab === t.key
              ? "bg-emerald-600 text-white shadow-md md:shadow-lg scale-105"
              : "text-zinc-400 hover:text-white hover:bg-zinc-800"}
            `}
        >
          <span className="text-xl md:text-lg">{t.icon}</span>
          <span className="hidden md:inline-block">{t.label}</span>
        </button>
      ))}
      <button
        onClick={logout}
        className="hidden md:block ml-auto text-sm text-red-600 underline px-3"
      >
        Cerrar sesión
      </button>
    </nav>
  );

  // LoginForm
  const LoginForm = () => {
    const [u, setU] = useState("");
    const [p, setP] = useState("");
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-zinc-900 to-zinc-800">
        <div className="bg-zinc-900 p-8 rounded-3xl shadow-2xl w-full max-w-sm border border-zinc-700">
          <div className="flex justify-center mb-4">
            <span className="text-5xl">📊</span>
          </div>
          <h1 className="text-3xl font-extrabold mb-4 text-center tracking-tight">Comisión Manager</h1>
          <input className="bg-zinc-800 border-zinc-700 border p-3 rounded-xl w-full mb-3 text-white placeholder:text-zinc-500" placeholder="Usuario" value={u} onChange={e => setU(e.target.value)} />
          <input className="bg-zinc-800 border-zinc-700 border p-3 rounded-xl w-full mb-6 text-white placeholder:text-zinc-500" type="password" placeholder="Contraseña" value={p} onChange={e => setP(e.target.value)} />
          <button className="w-full bg-emerald-500 hover:bg-emerald-600 text-white py-3 rounded-xl font-semibold transition shadow" onClick={() => login(u, p)}>
            Iniciar sesión
          </button>
          <p className="text-center text-xs text-zinc-400 mt-4 tracking-tight">Version Alfa 1.0</p>
        </div>
      </div>
    );
  };
  

const CutTab = () => {
  if (!currentUser) return null;
  // Obtener rutas que le pertenecen al operador
  const rutasOperador = routes.filter(r => r.operator === `${currentUser.firstName} ${currentUser.lastName}`);
  const [selectedRoute, setSelectedRoute] = useState("");
  const [selectedClient, setSelectedClient] = useState("");
  // Filtra solo clientes de esa ruta y activos
  const clientesDisponibles = clients.filter(c => c.route === selectedRoute && c.active);
  // Solo máquinas asignadas a ese cliente y activas
  const maquinasCliente = machines.filter(m =>
    m.client === selectedClient && m.active
  );
  // Checar si ya existe corte de hoy para ese cliente
  const today = new Date().toISOString().slice(0, 10);
  const corteHoy = cuts.find(c =>
    c.clientId === selectedClient && c.date === today
  );

  // Almacena score/real/ok de cada máquina
  const [form, setForm] = useState({});
  useEffect(() => { // Reset al cambiar cliente
    setForm({});
  }, [selectedClient]);

  // Calcula si todos los campos están listos
  const completo = maquinasCliente.length > 0 &&
    maquinasCliente.every(m => form[m.id]?.score && form[m.id]?.real && form[m.id]?.ok !== undefined);

  // Cálculo de totales y advertencias
  let total = 0;
  const warnings = [];
  maquinasCliente.forEach(m => {
    const f = form[m.id];
    if (f) {
      total += parseFloat(f.real || 0);
      if (Math.abs((f.score || 0) - (f.real || 0)) > 200)
        warnings.push(`¡Advertencia! Máquina #${m.numero} rebasa $200 de diferencia.`);
    }
  });

  // Proceso de corte
  const [confirm, setConfirm] = useState(false);
  const [signing, setSigning] = useState(false);
  const [firma, setFirma] = useState(null);

  // Firma canvas
  const CanvasFirma = ({ onDone }) => {
    const ref = React.useRef();
    let drawing = false;
    useEffect(() => {
      const canvas = ref.current;
      const ctx = canvas.getContext('2d');
      ctx.lineWidth = 2;
      let last = null;
      function start(e) { drawing = true; last = [e.offsetX, e.offsetY]; }
      function move(e) {
        if (!drawing) return;
        ctx.beginPath();
        ctx.moveTo(...last);
        ctx.lineTo(e.offsetX, e.offsetY);
        ctx.stroke();
        last = [e.offsetX, e.offsetY];
      }
      function end() { drawing = false; }
      canvas.addEventListener('mousedown', start);
      canvas.addEventListener('mousemove', move);
      canvas.addEventListener('mouseup', end);
      canvas.addEventListener('mouseleave', end);
      return () => {
        canvas.removeEventListener('mousedown', start);
        canvas.removeEventListener('mousemove', move);
        canvas.removeEventListener('mouseup', end);
        canvas.removeEventListener('mouseleave', end);
      };
    }, []);
    function handleDone() {
      onDone(ref.current.toDataURL());
    }
    function handleClear() {
      const ctx = ref.current.getContext('2d');
      ctx.clearRect(0, 0, ref.current.width, ref.current.height);
    }
    return (
      <div className="flex flex-col items-center gap-2">
        <canvas ref={ref} width={320} height={120} className="border bg-white" style={{touchAction: 'none'}} />
        <div className="flex gap-2">
          <button onClick={handleClear} className="px-3 py-1 bg-gray-200 rounded">Borrar</button>
          <button onClick={handleDone} className="px-3 py-1 bg-blue-600 text-white rounded">Guardar firma</button>
        </div>
      </div>
    );
  };

  // Ticket PDF DEMO
  function downloadPDF() {
    // Solo demo: genera una descarga simple
    const cliente = clients.find(c => c.id === selectedClient);
    let txt = `Corte de Máquinas\nCliente: ${cliente?.firstName} ${cliente?.lastName}\nRuta: ${cliente?.route}\nFecha: ${today}\nOperador: ${currentUser.firstName} ${currentUser.lastName}\n\n`;
    maquinasCliente.forEach(m => {
      const f = form[m.id];
      txt += `Máquina #${m.numero} | Score: ${f?.score} | Real: ${f?.real} | OK: ${f?.ok ? 'Sí' : 'No'}\n`;
    });
    txt += `\nTotal Real: $${total}\nComisión (${cliente?.commission}%): $${(total * (cliente?.commission/100)).toFixed(2)}\n`;
    txt += firma ? `[Incluye firma]\n` : '';
    const blob = new Blob([txt], {type: 'text/plain'});
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = `ticket-corte-${today}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  }

  // Guardar corte definitivo
  const guardarCorte = () => {
    setCuts([...cuts, {
      clientId: selectedClient,
      operatorId: currentUser.id,
      date: today,
      maquinas: maquinasCliente.map(m => ({
        id: m.id,
        numero: m.numero,
        type: m.type,
        score: form[m.id]?.score,
        real: form[m.id]?.real,
        ok: form[m.id]?.ok,
      })),
      total,
      firma,
    }]);
    setConfirm(false);
    setSigning(false);
    setFirma(null);
    setForm({});
    setSelectedClient("");
    alert("¡Corte guardado y ticket generado!");
  };

  if (currentUser.rol === "operator" && rutasOperador.length === 0) {
    return <div className="text-center text-gray-600">No tienes rutas asignadas.</div>;
  }

  return (
    <div className="space-y-8">
      {/* Selección de ruta */}
      <div>
        <label className="block font-bold mb-1">Ruta asignada</label>
        <select className="border rounded p-2 w-full md:w-auto" value={selectedRoute} onChange={e => setSelectedRoute(e.target.value)}>
          <option value="">-- Selecciona ruta --</option>
          {rutasOperador.map(r => (
            <option key={r.name} value={r.name}>{r.name}</option>
          ))}
        </select>
      </div>
      {/* Selección de cliente */}
      {selectedRoute && (
        <div>
          <label className="block font-bold mb-1">Cliente</label>
          <select className="border rounded p-2 w-full md:w-auto" value={selectedClient} onChange={e => setSelectedClient(e.target.value)}>
            <option value="">-- Selecciona cliente --</option>
            {clientesDisponibles.map(c => (
              <option key={c.id} value={c.id}>{c.firstName} {c.lastName}</option>
            ))}
          </select>
        </div>
      )}

      {/* Máquinas para corte */}
      {selectedClient && (
        corteHoy
          ? <div className="text-red-600 font-bold">Ya existe un corte registrado para este cliente hoy.</div>
          : (
            maquinasCliente.length === 0
              ? <div className="text-gray-500">Este cliente no tiene máquinas asignadas.</div>
              : <div className="border p-4 rounded-2xl shadow space-y-4">
                <h3 className="font-bold text-lg">Registrar Corte</h3>
                {maquinasCliente.map(m => (
                  <div key={m.id} className="flex flex-col md:flex-row md:items-center gap-2 border-b pb-2">
                    <span className="min-w-[180px] font-semibold">Máquina #{m.numero} ({m.type})</span>
                    <input
                      className="border p-1 rounded w-20"
                      type="number"
                      placeholder="Score"
                      value={form[m.id]?.score || ""}
                      onChange={e => setForm(f => ({ ...f, [m.id]: { ...f[m.id], score: e.target.value } }))}
                    />
                    <input
                      className="border p-1 rounded w-20"
                      type="number"
                      placeholder="Valor real"
                      value={form[m.id]?.real || ""}
                      onChange={e => setForm(f => ({ ...f, [m.id]: { ...f[m.id], real: e.target.value } }))}
                    />
                    <label className="flex items-center gap-1 ml-4">
                      <input
                        type="checkbox"
                        checked={form[m.id]?.ok || false}
                        onChange={e => setForm(f => ({ ...f, [m.id]: { ...f[m.id], ok: e.target.checked } }))}
                      />
                      Funciona
                    </label>
                    {form[m.id]?.score && form[m.id]?.real && Math.abs((form[m.id]?.score - form[m.id]?.real)) > 200 && (
                      <span className="text-orange-500 font-bold">⚠ Diferencia mayor a $200</span>
                    )}
                  </div>
                ))}
                <div className="flex flex-col md:flex-row gap-4 items-center mt-2">
                  <span>Total: <b>${total.toFixed(2)}</b></span>
                  <span>Comisión: <b>{clients.find(c => c.id === selectedClient)?.commission}%</b> (${(total * (clients.find(c => c.id === selectedClient)?.commission/100 || 0)).toFixed(2)})</span>
                  {warnings.length > 0 && (
                    <div className="text-orange-600">
                      {warnings.map((w, i) => <div key={i}>{w}</div>)}
                    </div>
                  )}
                  <button
                    className={`ml-auto px-4 py-2 rounded bg-blue-600 text-white ${completo ? '' : 'opacity-50 cursor-not-allowed'}`}
                    disabled={!completo}
                    onClick={() => setConfirm(true)}
                  >
                    Generar corte
                  </button>
                </div>
              </div>
          )
      )}

      {/* Confirmación modal */}
      {confirm && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-8 shadow-xl max-w-md w-full">
            <h3 className="text-lg font-bold mb-3">¿Generar corte? No se podrá modificar después.</h3>
            <button className="bg-green-600 text-white px-4 py-2 rounded" onClick={() => { setConfirm(false); setSigning(true); }}>Sí, continuar</button>
            <button className="ml-3 text-sm underline" onClick={() => setConfirm(false)}>Cancelar</button>
          </div>
        </div>
      )}

      {/* Firma y Ticket */}
      {signing && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-8 shadow-xl max-w-xl w-full flex flex-col gap-4 items-center">
            <h3 className="font-bold text-lg">Firma del cliente</h3>
            <CanvasFirma onDone={setFirma} />
            <button
              className="bg-blue-600 text-white px-4 py-2 rounded"
              onClick={() => { guardarCorte(); downloadPDF(); }}
              disabled={!firma}
            >
              Guardar corte y generar ticket PDF
            </button>
            <button className="text-sm underline" onClick={() => setSigning(false)}>Cancelar</button>
          </div>
        </div>
      )}
    </div>
  );
};

  // SOLO admin puede ver y usar esta pestaña:
  const OperatorsTab = () => {
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


  const MachinesTab = () => {
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
  

  const ClientsTab = () => {
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
  const [clients, setClients] = useState([]);

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



  const RoutesTab = () => {
    if (currentUser?.rol !== "admin") return null;
    const [form, setForm] = useState({ name: "", operator: "" });
    const [editingId, setEditingId] = useState(null);

    const handleSave = () => {
      if (!form.name.trim()) return;
      if (editingId) {
        setRoutes(routes.map(r => (r.id === editingId ? { ...r, ...form } : r)));
      } else {
        setRoutes([...routes, { id: crypto.randomUUID(), ...form }]);
      }
      setForm({ name: "", operator: "" });
      setEditingId(null);
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
  
  
  const ReportsTab = () => {
  // Filtra cortes visibles según rol:
  let cortesVisibles = cuts;
  if (currentUser.rol === "operator") {
    // Solo cortes hechos por él o de sus rutas/clientes
    const rutasOperador = routes.filter(r => r.operator === `${currentUser.firstName} ${currentUser.lastName}`).map(r => r.name);
    const clientesOp = clients.filter(c => rutasOperador.includes(c.route)).map(c => c.id);
    cortesVisibles = cuts.filter(cut => clientesOp.includes(cut.clientId));
  }

  // Filtros
  const [qCliente, setQCliente] = useState("");
  const [qRuta, setQRuta] = useState("");
  const [qFecha, setQFecha] = useState("");
  let cortesFiltrados = cortesVisibles
    .filter(cut => !qCliente || clients.find(c => c.id === cut.clientId)?.firstName.toLowerCase().includes(qCliente.toLowerCase()))
    .filter(cut => !qRuta || clients.find(c => c.id === cut.clientId)?.route === qRuta)
    .filter(cut => !qFecha || cut.date === qFecha);

  // Ticket reusado
  function ticketTexto(cut) {
    const cliente = clients.find(c => c.id === cut.clientId);
    let txt = `${settings.reportTitle}\nCliente: ${cliente?.firstName} ${cliente?.lastName}\nRuta: ${cliente?.route}\nFecha: ${cut.date}\nOperador: ${operators.find(o => o.id === cut.operatorId)?.firstName || ""}\n\n`;
    cut.maquinas.forEach(m => {
      txt += `Máquina #${m.numero} | Score: ${m.score} | Real: ${m.real} | OK: ${m.ok ? 'Sí' : 'No'}\n`;
    });
    txt += `\nTotal Real: $${cut.total}\nComisión (${cliente?.commission}%): $${(cut.total * (cliente?.commission/100)).toFixed(2)}\n`;
    txt += cut.firma ? `[Incluye firma]\n` : '';
    return txt;
  }

  function descargarTicket(cut) {
    const txt = ticketTexto(cut);
    const blob = new Blob([txt], {type: 'text/plain'});
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = `ticket-corte-${cut.date}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div>
      <h2 className="text-xl font-bold mb-4">Reportes de Cortes</h2>
      <div className="flex flex-wrap gap-2 mb-4">
        <input className="border p-1 rounded" placeholder="Buscar cliente" value={qCliente} onChange={e => setQCliente(e.target.value)} />
        <select className="border p-1 rounded" value={qRuta} onChange={e => setQRuta(e.target.value)}>
          <option value="">-- Ruta --</option>
          {[...new Set(clients.map(c => c.route))].map(r => <option key={r} value={r}>{r}</option>)}
        </select>
        <input className="border p-1 rounded" type="date" value={qFecha} onChange={e => setQFecha(e.target.value)} />
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-full border bg-white">
          <thead>
            <tr>
              <th className="border px-2">Fecha</th>
              <th className="border px-2">Cliente</th>
              <th className="border px-2">Ruta</th>
              <th className="border px-2">Total</th>
              <th className="border px-2">Comisión</th>
              <th className="border px-2"></th>
            </tr>
          </thead>
          <tbody>
            {cortesFiltrados.length === 0 && (
              <tr>
                <td colSpan={6} className="text-center p-4 text-gray-500">No hay cortes con ese filtro.</td>
              </tr>
            )}
            {cortesFiltrados.map((cut, idx) => {
              const cliente = clients.find(c => c.id === cut.clientId);
              return (
                <tr key={idx}>
                  <td className="border px-2">{cut.date}</td>
                  <td className="border px-2">{cliente?.firstName} {cliente?.lastName}</td>
                  <td className="border px-2">{cliente?.route}</td>
                  <td className="border px-2">${cut.total.toFixed(2)}</td>
                  <td className="border px-2">${(cut.total * (cliente?.commission/100)).toFixed(2)}</td>
                  <td className="border px-2">
                    <button className="text-blue-600 underline" onClick={() => descargarTicket(cut)}>
                      Descargar Ticket
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

  const ConfigTab = () => {
  // Solo admin puede ver
  if (currentUser?.rol !== "admin") return null;
  const [form, setForm] = useState({
    oldpass: "",
    newpass: "",
    emailFrom: settings.emailFrom,
    reportTitle: settings.reportTitle,
  });
  // Cambiar contraseña (de la cuenta logueada)
  function cambiarPass() {
    if (form.oldpass !== currentUser.password) {
      alert("Contraseña actual incorrecta");
      return;
    }
    setOperators(ops =>
      ops.map(op => op.id === currentUser.id
        ? { ...op, password: form.newpass }
        : op
      )
    );
    alert("Contraseña cambiada");
    setForm({ ...form, oldpass: "", newpass: "" });
  }
  // Cambiar email/titulo
  function guardarConfig() {
    setSettings({ emailFrom: form.emailFrom, reportTitle: form.reportTitle });
    alert("Configuración actualizada");
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

  const renderTab = () => {
    switch (tab) {
      case "cut": return <CutTab />;
      case "operators": return <OperatorsTab />;
      case "machines": return <MachinesTab />;
      case "routes": return <RoutesTab />;
      case "clients": return <ClientsTab />;
      case "reports": return <ReportsTab />;
      case "config": return <ConfigTab />;
      default: return null;
    }
  };

  // Layout Spotify
  return currentUser ? (
    <div className="min-h-screen flex flex-col bg-zinc-950 text-white">
      <div className="flex-shrink-0 px-4 pt-4 pb-2 md:pb-0 md:pt-6 md:px-0">
        <h1 className="text-2xl md:text-4xl font-extrabold mb-2 tracking-tight flex items-center gap-2 drop-shadow-lg">
          <span className="text-4xl md:text-5xl">🎧</span> Comisión Tracker
        </h1>
      </div>
      <div className="flex-1 flex flex-col max-w-4xl w-full mx-auto p-2 pb-24 md:pb-6 md:p-4 gap-4">
        {renderTab()}
      </div>
      <TabBar />
    </div>
  ) : (
    <LoginForm />
  );
}

