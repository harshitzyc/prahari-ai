import { useState } from "react";
import { Link } from "react-router-dom";
import { useApi, post } from "../api";
import { fmtMoney, RISK_BADGE, SIGNAL_META } from "../utils";
import { ClipboardCheck, CheckCircle2, XCircle, AlertTriangle, FileText } from "lucide-react";

export default function Verification() {
  const { data: queue, loading, error, refetch } = useApi("/verification/queue");
  const [remarks, setRemarks] = useState({});
  const [reasons, setReasons] = useState({});
  const [busy, setBusy] = useState(null);

  if (loading) return <div className="text-slate-500 p-8">Loading verification queue…</div>;
  if (error) return <div className="card p-8 text-rose-600">Unable to reach API.</div>;

  const pending = queue.filter((p) => p.verification.status === "pending").length;

  const act = async (p, action) => {
    if (!reasons[p.id] && action === "dismiss") {
      alert("Please select a reason for dismissing this flag to improve model retraining.");
      return;
    }
    setBusy(p.id);
    try {
      await post(`/verification/${p.id}`, { action, remark: `${reasons[p.id] || ''} | ${remarks[p.id] || ''}` });
      refetch();
    } finally { setBusy(null); }
  };

  return (
    <div className="space-y-6">
      <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-4 flex items-start gap-3">
        <AlertTriangle className="text-indigo-700 shrink-0 mt-0.5" size={20} />
        <div>
          <h3 className="font-bold text-indigo-900 text-sm">Human-in-the-Loop Protocol</h3>
          <p className="text-xs text-indigo-800 mt-1">
            AI flags are strictly <b>advisory</b>. As a Nodal Officer, your decision is final. 
            Structured feedback is logged to the continuous-learning retraining pipeline.
          </p>
        </div>
      </div>

      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
          <ClipboardCheck className="text-indigo-600" size={22} /> Verification Queue
        </h2>
        <span className="bg-rose-100 text-rose-700 px-3 py-1 rounded-full text-xs font-bold">{pending} Pending Actions</span>
      </div>

      <div className="space-y-4">
        {queue.map((p) => (
          <div key={p.id} className="card p-6 border-l-4 border-l-indigo-600">
            <div className="flex flex-wrap items-start justify-between gap-4 mb-4">
              <div>
                <div className="text-xs font-mono text-slate-500">{p.work_code}</div>
                <Link to={`/projects/${p.id}`} className="font-bold text-slate-900 hover:text-indigo-600 text-lg">{p.name}</Link>
                <div className="text-sm text-slate-600 mt-1">{p.district} · {p.constituency} · {fmtMoney(p.sanctioned_amount)}</div>
              </div>
              <div className="flex items-center gap-2 bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-200">
                <span className={`chip rounded-full px-3 py-1 text-sm font-bold ${RISK_BADGE[p.risk_level]}`}>{p.risk_score}/100</span>
                <span className="text-[10px] text-slate-500 font-semibold uppercase">⚠️ AI Advisory</span>
              </div>
            </div>

            <div className="bg-slate-50 rounded-lg p-3 mb-4 border border-slate-200">
              <div className="text-xs font-bold text-slate-700 mb-2 flex items-center gap-1"><FileText size={12}/> AI Detection Summary:</div>
              <ul className="space-y-1.5">
                {p.factors.slice(0, 3).map((f, i) => (
                  <li key={i} className="text-sm text-slate-700 flex gap-2">
                    <span className={`mt-1.5 h-2 w-2 rounded-full shrink-0 ${SIGNAL_META[f.signal].bar}`} />
                    <span><b>{f.label}:</b> {f.detail}</span>
                  </li>
                ))}
              </ul>
            </div>

            {p.verification.status === "pending" ? (
              <div className="space-y-3 border-t border-slate-100 pt-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Decision Reason (Required for Dismissal)</label>
                    <select 
                      className="input w-full"
                      value={reasons[p.id] || ""}
                      onChange={(e) => setReasons({ ...reasons, [p.id]: e.target.value })}
                    >
                      <option value="">Select a reason...</option>
                      <option value="Confirmed Fraud">Confirmed Fraud / Ghost Asset</option>
                      <option value="Data Entry Error">False Positive - Data Entry Error</option>
                      <option value="Legitimate Delay">False Positive - Legitimate Delay</option>
                      <option value="Geo-Tag Glitch">False Positive - GPS/Geo-tag Glitch</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Official Remarks</label>
                    <input 
                      className="input w-full" 
                      placeholder="Add remarks for the audit trail..."
                      value={remarks[p.id] || ""}
                      onChange={(e) => setRemarks({ ...remarks, [p.id]: e.target.value })}
                    />
                  </div>
                </div>
                <div className="flex gap-3 justify-end">
                  <button disabled={busy === p.id} onClick={() => act(p, "dismiss")} className="btn-outline bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100 flex items-center gap-2">
                    <XCircle size={16} /> Dismiss Flag (False Positive)
                  </button>
                  <button disabled={busy === p.id} onClick={() => act(p, "confirm")} className="btn-primary bg-rose-600 hover:bg-rose-700 flex items-center gap-2">
                    <CheckCircle2 size={16} /> Confirm & Refer to Audit
                  </button>
                </div>
              </div>
            ) : (
              <div className={`rounded-lg px-4 py-3 text-sm font-medium flex items-center gap-2 ${
                p.verification.status === "confirmed" ? "bg-rose-50 text-rose-700 border border-rose-200" : "bg-emerald-50 text-emerald-700 border border-emerald-200"
              }`}>
                {p.verification.status === "confirmed" ? <CheckCircle2 size={16}/> : <XCircle size={16}/>}
                Flag {p.verification.status === "confirmed" ? "Confirmed" : "Dismissed"} — Logged to Audit Trail.
                <span className="text-xs font-normal ml-2">({p.verification.officer} · {p.verification.at})</span>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}