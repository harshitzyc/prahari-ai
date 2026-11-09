import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { get } from "../api";
import { fmtMoney, RISK_BADGE } from "../utils";
import { Users, IndianRupee, AlertTriangle, TrendingUp, Search } from "lucide-react";

export default function MPDashboard() {
  const [rows, setRows] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    get("/mp-dashboard").then((d) => { setRows(d); setLoading(false); }).catch(() => setLoading(false));
  }, []);

  const filtered = rows.filter((r) =>
    (r.mp + r.constituency + r.district).toLowerCase().includes(search.toLowerCase())
  );

  const totals = {
    mps: rows.length,
    works: rows.reduce((a, r) => a + r.total_works, 0),
    sanctioned: rows.reduce((a, r) => a + r.sanctioned_cr, 0),
    highRisk: rows.reduce((a, r) => a + r.high_risk, 0),
  };

  if (loading) return <div className="text-slate-500">Loading MP dashboard…</div>;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h2 className="text-xl font-bold">MP / Constituency View</h2>
          <p className="text-sm text-slate-500">Per-MP risk and fund utilization summary</p>
        </div>
        <div className="relative">
          <Search size={16} className="absolute left-3 top-2.5 text-slate-400" />
          <input className="input pl-9" placeholder="Search MP, constituency…"
                 value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="card p-4 flex items-center gap-3">
          <Users className="text-indigo-600" size={22} />
          <div><div className="text-xl font-bold">{totals.mps}</div><div className="text-xs text-slate-500">MPs (Pilot)</div></div>
        </div>
        <div className="card p-4 flex items-center gap-3">
          <IndianRupee className="text-emerald-600" size={22} />
          <div><div className="text-xl font-bold">₹{totals.sanctioned.toFixed(1)} Cr</div><div className="text-xs text-slate-500">Total Sanctioned</div></div>
        </div>
        <div className="card p-4 flex items-center gap-3">
          <TrendingUp className="text-blue-600" size={22} />
          <div><div className="text-xl font-bold">{totals.works}</div><div className="text-xs text-slate-500">Total Works</div></div>
        </div>
        <div className="card p-4 flex items-center gap-3">
          <AlertTriangle className="text-rose-600" size={22} />
          <div><div className="text-xl font-bold">{totals.highRisk}</div><div className="text-xs text-slate-500">High-Risk Works</div></div>
        </div>
      </div>

      {/* MP Table */}
      <div className="card overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-xs text-slate-500 border-b border-slate-200 bg-slate-50">
              <th className="p-3">MP Name</th>
              <th className="p-3">Constituency</th>
              <th className="p-3">District</th>
              <th className="p-3">Works</th>
              <th className="p-3">Sanctioned</th>
              <th className="p-3">Utilisation</th>
              <th className="p-3">Avg Risk</th>
              <th className="p-3">High Risk</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((r) => (
              <tr key={r.mp} className="border-b border-slate-100 hover:bg-slate-50">
                <td className="p-3 font-medium">{r.mp}</td>
                <td className="p-3">{r.constituency}</td>
                <td className="p-3 text-slate-500">{r.district}</td>
                <td className="p-3">{r.total_works}</td>
                <td className="p-3">₹{r.sanctioned_cr} Cr</td>
                <td className="p-3">
                  <div className="flex items-center gap-2">
                    <div className="w-16 h-1.5 rounded-full bg-slate-100">
                      <div className="h-1.5 rounded-full bg-emerald-500" style={{ width: `${r.utilization_pct}%` }} />
                    </div>
                    <span className="text-xs">{r.utilization_pct}%</span>
                  </div>
                </td>
                <td className="p-3">
                  <span className={`chip rounded-full px-2 py-0.5 text-xs font-bold ${
                    r.avg_risk >= 50 ? "bg-rose-100 text-rose-700" :
                    r.avg_risk >= 25 ? "bg-amber-100 text-amber-700" :
                    "bg-emerald-100 text-emerald-700"
                  }`}>{r.avg_risk}</span>
                </td>
                <td className="p-3">
                  {r.high_risk > 0 ? (
                    <span className="chip rounded-full bg-rose-100 text-rose-700 px-2 py-0.5 text-xs font-bold">
                      {r.high_risk}
                    </span>
                  ) : <span className="text-slate-400">—</span>}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}