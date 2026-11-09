import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { get } from "../api";
import { fmtMoney, RISK_BADGE, STATUS_CHIP } from "../utils";
import { Search } from "lucide-react";

export default function Projects() {
  const nav = useNavigate();
  const [filters, setFilters] = useState(null);
  const [rows, setRows] = useState([]);
  const [q, setQ] = useState({ search: "", district: "", status: "", risk: "" });

  useEffect(() => { get("/filters").then(setFilters).catch(() => {}); }, []);

  useEffect(() => {
    const params = new URLSearchParams(Object.entries(q).filter(([, v]) => v));
    get(`/projects?${params}`).then(setRows).catch(() => setRows([]));
  }, [q]);

  const set = (k) => (e) => setQ({ ...q, [k]: e.target.value });

  return (
    <div className="space-y-4">
      <div className="card p-4 flex flex-wrap gap-3 items-center">
        <div className="relative flex-1 min-w-[220px]">
          <Search size={16} className="absolute left-3 top-2.5 text-slate-400" />
          <input className="input w-full pl-9" placeholder="Search name, code, vendor, constituency…"
                 value={q.search} onChange={set("search")} />
        </div>
        <select className="input" value={q.district} onChange={set("district")}>
          <option value="">All Districts</option>
          {filters?.districts.map((d) => <option key={d}>{d}</option>)}
        </select>
        <select className="input" value={q.status} onChange={set("status")}>
          <option value="">All Statuses</option>
          {filters?.statuses.map((s) => <option key={s}>{s}</option>)}
        </select>
        <select className="input" value={q.risk} onChange={set("risk")}>
          <option value="">All Risk Levels</option>
          {filters?.risk_levels.map((r) => <option key={r}>{r}</option>)}
        </select>
        <span className="text-sm text-slate-500">{rows.length} works</span>
      </div>

      <div className="card overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-xs text-slate-500 border-b border-slate-200 bg-slate-50">
              <th className="p-3">Work Code</th><th className="p-3">Project</th>
              <th className="p-3">District / Constituency</th><th className="p-3">Category</th>
              <th className="p-3">Sanctioned</th><th className="p-3">Utilised</th>
              <th className="p-3">Status</th><th className="p-3">Risk</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((p) => (
              <tr key={p.id} onClick={() => nav(`/projects/${p.id}`)}
                  className="border-b border-slate-100 hover:bg-indigo-50/40 cursor-pointer">
                <td className="p-3 font-mono text-xs">{p.work_code}</td>
                <td className="p-3 max-w-[300px] truncate font-medium">{p.name}</td>
                <td className="p-3">{p.district}<div className="text-xs text-slate-400">{p.constituency}</div></td>
                <td className="p-3 text-xs">{p.category}</td>
                <td className="p-3">{fmtMoney(p.sanctioned_amount)}</td>
                <td className="p-3">
                  <div className="w-24 h-1.5 rounded-full bg-slate-100">
                    <div className="h-1.5 rounded-full bg-indigo-500"
                         style={{ width: `${p.released_amount ? Math.min(100, (p.utilized_amount / p.released_amount) * 100) : 0}%` }} />
                  </div>
                  <span className="text-[11px] text-slate-400">
                    {p.released_amount ? Math.round((p.utilized_amount / p.released_amount) * 100) : 0}% of released
                  </span>
                </td>
                <td className="p-3">
                  <span className={`chip rounded-full px-2.5 py-0.5 text-xs ${STATUS_CHIP[p.status]}`}>{p.status}</span>
                </td>
                <td className="p-3">
                  <span className={`chip rounded-full px-2.5 py-0.5 text-xs font-bold ${RISK_BADGE[p.risk_level]}`}>
                    {p.risk_score}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}