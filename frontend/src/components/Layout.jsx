import { useState, useEffect } from "react";
import { NavLink, Outlet } from "react-router-dom";
import { ShieldCheck, LayoutDashboard, FolderKanban, Map, ClipboardCheck, UserCircle2, Bell, LogOut, ScrollText, X, Users } from "lucide-react";
import { get } from "../api";
import { Upload } from "lucide-react";

const NAV = [
  { to: "/", label: "Dashboard", icon: LayoutDashboard, end: true },
  { to: "/projects", label: "Projects", icon: FolderKanban },
  { to: "/map", label: "Map View", icon: Map },
  { to: "/verification", label: "Verification", icon: ClipboardCheck },
  { to: "/mp", label: "MP View", icon: Users },
  { to: "/upload", label: "Upload Data", icon: Upload },
];

export default function Layout({ user, onLogout }) {
  const [showNotif, setShowNotif] = useState(false);
  const [alerts, setAlerts] = useState([]);
  const [showTrail, setShowTrail] = useState(false);
  const [trail, setTrail] = useState([]);

  useEffect(() => {
    get("/top-risky?limit=5").then(setAlerts).catch(() => {});
    get("/verification/queue").then((q) => {
      const logs = q.filter((p) => p.verification.status !== "pending").map((p) => ({
        time: p.verification.at,
        officer: p.verification.officer,
        action: p.verification.status === "confirmed" ? "CONFIRMED" : "DISMISSED",
        project: p.work_code,
        remark: p.verification.remark,
      }));
      setTrail(logs.reverse());
    }).catch(() => {});
  }, []);

  return (
    <div className="min-h-screen flex">
      {/* Sidebar */}
      <aside className="w-20 lg:w-64 shrink-0 bg-slate-900 text-slate-300 flex flex-col sticky top-0 h-screen">
        <div className="flex items-center gap-3 px-4 lg:px-6 h-16 border-b border-slate-800">
          <span className="bg-indigo-600 rounded-lg p-2"><ShieldCheck size={20} className="text-white" /></span>
          <div className="hidden lg:block">
            <div className="text-white font-bold tracking-wide">PRAHARI</div>
            <div className="text-[11px] text-slate-400">MPLADS AI Oversight</div>
          </div>
        </div>
        <nav className="flex-1 py-4 space-y-1 px-3">
          {NAV.map(({ to, label, icon: Icon, end }) => (
            <NavLink key={to} to={to} end={end}
              className={({ isActive }) =>
                `flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition ${
                  isActive ? "bg-indigo-600 text-white" : "hover:bg-slate-800 hover:text-white"}`}>
              <Icon size={18} />
              <span className="hidden lg:inline">{label}</span>
            </NavLink>
          ))}
        </nav>
        <div className="hidden lg:block px-6 py-4 text-[11px] text-slate-500 border-t border-slate-800">
          SIH 2026 · PS 26102<br />Team HexaCore · Smart Automation
        </div>
      </aside>

      {/* Main */}
      <div className="flex-1 min-w-0 flex flex-col">
        <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-6 sticky top-0 z-40">
          <div>
            <h1 className="font-semibold text-slate-800">AI-Powered MPLADS Anomaly & Fraud Detection</h1>
            <p className="text-xs text-slate-500">Advisory intelligence layer over eSAKSHI · Human-in-the-loop</p>
          </div>
          <div className="flex items-center gap-3">
            {/* Audit Trail Button */}
            <button onClick={() => setShowTrail(!showTrail)}
              className="relative p-2 rounded-lg hover:bg-slate-100 text-slate-600 transition" title="Audit Trail">
              <ScrollText size={20} />
            </button>

            {/* Notification Bell */}
            <div className="relative">
              <button onClick={() => setShowNotif(!showNotif)}
                className="relative p-2 rounded-lg hover:bg-slate-100 text-slate-600 transition" title="Alerts">
                <Bell size={20} />
                {alerts.length > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 bg-rose-500 text-white text-[10px] font-bold rounded-full h-5 w-5 flex items-center justify-center">
                    {alerts.length}
                  </span>
                )}
              </button>

              {/* Notification Dropdown */}
              {showNotif && (
                <div className="absolute right-0 top-12 w-80 card shadow-xl border border-slate-200 z-50">
                  <div className="flex items-center justify-between p-3 border-b border-slate-100">
                    <h3 className="font-semibold text-sm">High-Risk Alerts</h3>
                    <button onClick={() => setShowNotif(false)} className="text-slate-400 hover:text-slate-600"><X size={16} /></button>
                  </div>
                  <div className="max-h-64 overflow-y-auto">
                    {alerts.map((a) => (
                      <NavLink key={a.id} to={`/projects/${a.id}`} onClick={() => setShowNotif(false)}
                        className="block px-3 py-2.5 hover:bg-slate-50 border-b border-slate-50 text-sm">
                        <div className="flex justify-between items-start">
                          <span className="font-medium text-slate-800 truncate max-w-[200px]">{a.name}</span>
                          <span className="bg-rose-100 text-rose-700 text-xs font-bold px-2 py-0.5 rounded-full">{a.risk_score}</span>
                        </div>
                        <div className="text-xs text-slate-500 mt-0.5">{a.work_code} · {a.headline}</div>
                      </NavLink>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* User Info */}
            <div className="hidden md:flex items-center gap-2 pl-3 border-l border-slate-200">
              <UserCircle2 size={22} className="text-indigo-600" />
              <div className="text-sm">
                <div className="font-medium text-slate-700">{user.name}</div>
                <div className="text-xs text-slate-400">{user.role} · {user.district}</div>
              </div>
            </div>

            {/* Logout */}
            <button onClick={onLogout} className="p-2 rounded-lg hover:bg-rose-50 text-slate-400 hover:text-rose-600 transition" title="Logout">
              <LogOut size={18} />
            </button>
          </div>
        </header>

        {/* Audit Trail Panel */}
        {showTrail && (
          <div className="bg-slate-900 text-slate-300 px-6 py-4 border-b border-slate-700">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold text-white flex items-center gap-2">
                <ScrollText size={16} /> Audit Trail
                <span className="text-xs font-normal text-slate-500">(Hyperledger Fabric in production)</span>
              </h3>
              <button onClick={() => setShowTrail(false)} className="text-slate-500 hover:text-white"><X size={16} /></button>
            </div>
            {trail.length === 0 ? (
              <p className="text-sm text-slate-500">No verification actions recorded yet. Confirm or dismiss flags to generate audit entries.</p>
            ) : (
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {trail.map((t, i) => (
                  <div key={i} className="flex items-start gap-3 text-sm">
                    <span className="text-xs text-slate-500 font-mono shrink-0 w-20">{t.time?.split("T")[1]?.slice(0, 5) || "--:--"}</span>
                    <span className={`shrink-0 px-2 py-0.5 rounded text-xs font-bold ${
                      t.action === "CONFIRMED" ? "bg-rose-500/20 text-rose-400" : "bg-emerald-500/20 text-emerald-400"
                    }`}>{t.action}</span>
                    <span className="text-slate-400">
                      <span className="text-slate-300">{t.officer}</span> {t.action.toLowerCase()} flag on <span className="font-mono text-indigo-400">{t.project}</span>
                      {t.remark && <span className="text-slate-500"> — "{t.remark}"</span>}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        <main className="flex-1 p-6">
          <Outlet />
        </main>
      </div>
      
    </div>
  );
}