import React, { useState, useEffect } from "react";

export default function CutTab({ currentUser, routes, clients, machines, cuts, setCuts }) {
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

