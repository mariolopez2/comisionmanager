import React, { useState, useEffect } from "react";
import Login from "./Login.jsx";
import CutTab from "./tabs/CutTab.jsx";
import OperatorsTab from "./tabs/OperatorsTab.jsx";
import MachinesTab from "./tabs/MachinesTab.jsx";
import ClientsTab from "./tabs/ClientsTab.jsx";
import RoutesTab from "./tabs/RoutesTab.jsx";
import ReportsTab from "./tabs/ReportsTab.jsx";
import ConfigTab from "./tabs/ConfigTab.jsx";
import { API_BASE, apiGet } from "./api.js";

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
  const logout = () => setCurrentUser(null);

  const fetchInitialData = async () => {
    try {
      const [routesData, operatorsData, machinesData, clientsData, cutsData, settingsData] = await Promise.all([
        apiGet('/routes'),
        apiGet('/operators'),
        apiGet('/machines'),
        apiGet('/clients'),
        apiGet('/cuts'),
        apiGet('/settings')
      ]);
      setRoutes(routesData || []);
      setOperators(operatorsData || []);
      setMachines(machinesData || []);
      setClients(clientsData || []);
      setCuts(cutsData || []);
      if (settingsData) setSettings(settingsData);
    } catch (err) {
      console.error("API error", err);
    }
  };

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
      const res = await fetch(`${API_BASE}/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password })
      });
      const data = await res.json();
      if (res.ok && data.user) {
        // Login exitoso
        setCurrentUser(data.user);
        setTab(data.user.rol === "admin" ? "cut" : "cut");
        fetchInitialData();
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
    return currentUser ? (
      <>
        {/* tu dashboard aquí */}
      </>
    ) : (
      <Login onLogin={login} />
    );
  }
  


  const renderTab = () => {
    switch (tab) {
      case "cut":
        return (
          <CutTab
            currentUser={currentUser}
            routes={routes}
            clients={clients}
            machines={machines}
            cuts={cuts}
            setCuts={setCuts}
          />
        );
      case "operators":
        return (
          <OperatorsTab
            currentUser={currentUser}
            operators={operators}
            setOperators={setOperators}
          />
        );
      case "machines":
        return (
          <MachinesTab
            currentUser={currentUser}
            routes={routes}
            machines={machines}
            setMachines={setMachines}
            clients={clients}
          />
        );
      case "routes":
        return (
          <RoutesTab
            currentUser={currentUser}
            routes={routes}
            setRoutes={setRoutes}
            operators={operators}
          />
        );
      case "clients":
        return (
          <ClientsTab
            currentUser={currentUser}
            clients={clients}
            setClients={setClients}
            routes={routes}
          />
        );
      case "reports":
        return (
          <ReportsTab
            currentUser={currentUser}
            cuts={cuts}
            routes={routes}
            clients={clients}
            operators={operators}
            settings={settings}
          />
        );
      case "config":
        return (
          <ConfigTab
            currentUser={currentUser}
            operators={operators}
            setOperators={setOperators}
            settings={settings}
            setSettings={setSettings}
          />
        );
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

