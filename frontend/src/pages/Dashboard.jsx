import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { get } from "../api";
import { fmtMoney, RISK_BADGE, SIGNAL_META } from "../utils";
import WhyFlagged from "../components/WhyFlagged";
import { AlertTriangle, CheckCircle2, Clock, IndianRupee, ArrowRight } from "lucide-react";
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, Cell, LineChart, Line } from "recharts";

const DIST_COLORS = { Low: "#10b981", Medium: "#f59e0b", High: "#e11d48" };

export default function Dashboard() {
  const [data, setData] = useState(null);
  const [selected, setSelected] = useState(null);

  useEffect(() => {
    Promise.all([
      get("/stats"), get("/analytics/distribution"), get("/analytics/evidence-mix"), get("/analytics/stage-risk"), get("/top-risky?limit=5"),
    ]).then(([stats, dist, mix, stages, top]) => setData({ stats, dist, mix, stages, top })).catch(() => {});
  }, []);

  if (!data) return <div className="text-slate-500 p-8">Loading dashboard…</div>;
  const { stats, dist, mix, stages, top } = data;

  return (
    <div className="space-y-6">
      {/* 1. Priority Inbox (Replaces generic KPIs) */}
      <div className="bg-gradient-to-r from-indigo-50 to-white border border-indigo-100 rounded-xl p-6 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
              <AlertTriangle className="text-rose-600" size={22} /> Priority Action Inbox
            </h2>
            <p className="text-sm text-slate-600 mt-1">AI has identified works requiring immediate officer verification.</p>
          </div>
          <Link to="/verification" className="btn-primary flex items-center gap-2">
            Review Pending Flags <ArrowRight size={16} />
          </Link>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white rounded-lg p-4 border border-rose-200 shadow-sm">
            <div className="text-xs text-rose-600 font-semibold uppercase">High Risk Alerts</div>
            <div className="text-3xl font-bold text-rose-700 mt-1">{stats.high_risk}</div>
            <div className="text-[11px] text-slate-500 mt-1">Requires immediate audit</div>
          </div>
          <div className="bg-white rounded-lg p-4 border border-amber-200 shadow-sm">
            <div className="text-xs text-amber-600 font-semibold uppercase">Pending Verification</div>
            <div className="text-3xl font-bold text-amber-700 mt-1">{stats.pending_verification}</div>
            <div className="text-[11px] text-slate-500 mt-1">Awaiting officer decision</div>
          </div>
          <div className="bg-white rounded-lg p-4 border border-slate-200 shadow-sm">
            <div className="text-xs text-slate-600 font-semibold uppercase">Unspent Funds (Pilot)</div>
            <div className="text-3xl font-bold text-slate-800 mt-1">₹{stats.unspent_cr} Cr</div>
            <div className="text-[11px] text-slate-500 mt-1">Target: ₹{stats.national_unspent_target_cr} Cr</div>
          </div>
          <div className="bg-white rounded-lg p-4 border border-emerald-200 shadow-sm">
            <div className="text-xs text-emerald-600 font-semibold uppercase">Works Monitored</div>
            <div className="text-3xl font-bold text-emerald-700 mt-1">{stats.total_works}</div>
            <div className="text-[11px] text-slate-500 mt-1">Across {stats.districts} districts</div>
          </div>
        </div>
      </div>

      {/* 2. Stage-Wise Risk Timeline (PPT Alignment) */}
      <div className="card p-5">
        <h3 className="font-semibold text-slate-800 mb-4 flex items-center gap-2">
          <Clock size={18} className="text-indigo-600" /> MPLADS Lifecycle Risk Signals
        </h3>
        <ResponsiveContainer width="100%" height={200}>
          <LineChart data={stages}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
            <XAxis dataKey="stage" tick={{ fontSize: 12, fill: '#475569' }} axisLine={false} tickLine={false} />
            <YAxis domain={[0, 100]} tick={{ fontSize: 12, fill: '#475569' }} axisLine={false} tickLine={false} />
            <Tooltip contentStyle={{ borderRadius: '8px', border: '1px solid #e2e8f0' }} />
            <Line type="monotone" dataKey="risk" stroke="#4f46e5" strokeWidth={3} dot={{ r: 6, fill: "#4f46e5", strokeWidth: 2, stroke: "#fff" }} />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* 3. Top Risky Works Table */}
      <div className="card p-5">
        <h3 className="font-semibold text-slate-800 mb-4">Top High-Risk Works — AI Alerts</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-xs text-slate-500 border-b border-slate-200 uppercase tracking-wider">
                <th className="py-2 pr-4">Work Code</th><th className="py-2 pr-4">Project</th>
                <th className="py-2 pr-4">Risk Score</th><th className="py-2 pr-4">Primary Signals</th>
                <th className="py-2" />
              </tr>
            </thead>
            <tbody>
              {top.map((p) => (
                <tr key={p.id} className="border-b border-slate-100 hover:bg-slate-50">
                  <td className="py-3 pr-4 font-mono text-xs text-slate-600">{p.work_code}</td>
                  <td className="py-3 pr-4 max-w-[300px] truncate font-medium text-slate-800">{p.name}</td>
                  <td className="py-3 pr-4">
                    <div className="flex items-center gap-2">
                      <span className={`chip rounded-full px-2.5 py-0.5 text-xs font-bold ${RISK_BADGE[p.risk_level]}`}>{p.risk_score}</span>
                      <span className="text-[10px] text-slate-400 font-medium">️ AI Advisory</span>
                    </div>
                  </td>
                  <td className="py-3 pr-4 text-xs text-slate-600">{p.headline}</td>
                  <td className="py-3 text-right">
                    <button onClick={() => setSelected(p)} className="text-indigo-600 hover:underline text-xs font-semibold">Why Flagged? →</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {selected && <WhyFlagged project={selected} onClose={() => setSelected(null)} />}
    </div>
  );
}