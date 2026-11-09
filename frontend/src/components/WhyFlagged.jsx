import { X, AlertTriangle } from "lucide-react";
import { SIGNAL_META, RISK_BADGE } from "../utils";

export default function WhyFlagged({ project, onClose }) {
  if (!project) return null;
  const maxC = Math.max(30, ...project.factors.map((f) => f.contribution));

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4" onClick={onClose}>
      <div className="card w-full max-w-2xl max-h-[85vh] overflow-y-auto p-6" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-indigo-600 text-xs font-semibold uppercase tracking-wide">
              <AlertTriangle size={14} /> Explainable AI · Why Flagged?
            </div>
            <h3 className="mt-1 font-semibold text-lg">{project.name}</h3>
            <p className="text-sm text-slate-500">{project.work_code} · {project.district} · {project.constituency}</p>
          </div>
          <div className="flex items-center gap-3">
            <span className={`chip rounded-full px-3 py-1 text-sm font-bold ${RISK_BADGE[project.risk_level]}`}>
              {project.risk_score}/100
            </span>
            <button onClick={onClose} className="text-slate-400 hover:text-slate-700"><X size={20} /></button>
          </div>
        </div>

        <p className="mt-2 text-sm font-medium text-slate-700">{project.headline}</p>

        <div className="mt-4 space-y-4">
          {project.factors.length === 0 && (
            <p className="text-sm text-slate-500">No anomaly signals above threshold.</p>
          )}
          {project.factors.map((f, i) => {
            const meta = SIGNAL_META[f.signal];
            return (
              <div key={i} className="border border-slate-200 rounded-lg p-3">
                <div className="flex items-center justify-between">
                  <span className={`chip rounded-full px-2.5 py-0.5 text-xs font-medium ${meta.chip}`}>{meta.label}</span>
                  <span className="text-xs font-semibold text-slate-600">+{f.contribution} pts</span>
                </div>
                <div className="mt-2 h-2 rounded-full bg-slate-100">
                  <div className={`h-2 rounded-full ${meta.bar}`}
                       style={{ width: `${Math.min(100, (f.contribution / maxC) * 100)}%` }} />
                </div>
                <p className="mt-2 text-sm text-slate-700">{f.detail}</p>
                {f.evidence?.length > 0 && (
                  <div className="mt-2 flex flex-wrap gap-2">
                    {f.evidence.map((e, j) => (
                      <span key={j} className="rounded bg-slate-100 px-2 py-0.5 text-[11px] text-slate-600">{e}</span>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        <p className="mt-4 text-xs text-slate-400">
          SHAP-style factor contributions (rule-based prototype). AI flags are advisory only —
          the designated officer takes the final decision (human-in-the-loop).
        </p>
      </div>
    </div>
  );
}