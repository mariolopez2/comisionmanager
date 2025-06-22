import React, { useState } from "react";

export default function ReportsTab({ currentUser, cuts, routes, clients, operators, settings }) {
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

