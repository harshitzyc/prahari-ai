import { useState } from "react";
import { useParams, Link } from "react-router-dom";
import { useApi, post } from "../api";
import { fmtMoney, fmtDate, RISK_BADGE, STATUS_CHIP, SIGNAL_META } from "../utils";
import EnhancedCVPanel from "../components/EnhancedCVPanel";
import { 
  ArrowLeft, ShieldAlert, ShieldCheck, ShieldX, Download, 
  FileText, IndianRupee, MapPin, User, Building2 
} from "lucide-react";
import jsPDF from "jspdf";
import "jspdf-autotable";

export default function ProjectDetail() {
  const { id } = useParams();
  const { data: p, loading, error, refetch } = useApi(`/projects/${id}`);
  const [remark, setRemark] = useState("");
  const [reason, setReason] = useState("");
  const [busy, setBusy] = useState(false);

  if (loading) return <div className="text-slate-500 p-8">Loading project details…</div>;
  if (error || !p) return <div className="card p-8 text-rose-600">Project not found.</div>;

  const v = p.verification;
  const releasedPct = Math.min(100, (p.released_amount / p.sanctioned_amount) * 100);
  const utilPct = p.released_amount ? Math.min(100, (p.utilized_amount / p.released_amount) * 100) : 0;

  const act = async (action) => {
    if (action === "dismiss" && !reason) {
      alert("Please select a reason for dismissal to improve model retraining.");
      return;
    }
    setBusy(true);
    try { 
      await post(`/verification/${p.id}`, { action, remark: `${reason} | ${remark}` }); 
      refetch(); 
      setRemark(""); 
      setReason("");
    } finally { 
      setBusy(false); 
    }
  };

  const exportPDF = () => {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    
    doc.setFillColor(13, 71, 161); // Ashoka Blue
    doc.rect(0, 0, pageWidth, 30, "F");
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(18);
    doc.setFont("helvetica", "bold");
    doc.text("PRAHARI — AI Anomaly Report", 14, 15);
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.text("Ministry of Statistics & Programme Implementation · SIH 2026", 14, 23);

    doc.setTextColor(0, 0, 0);
    doc.setFontSize(12);
    doc.setFont("helvetica", "bold");
    doc.text("Official Work Details (eSAKSHI Data)", 14, 42);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);

    const info = [
      ["Work Code", p.work_code],
      ["Project Name", p.name],
      ["Category", p.category],
      ["District / Constituency", `${p.district} · ${p.constituency}`],
      ["MP", p.mp],
      ["Vendor", p.vendor],
      ["Sanctioned Amount", `Rs ${p.sanctioned_amount} Lakh`],
      ["Released Amount", `Rs ${p.released_amount} Lakh`],
      ["Utilised Amount", `Rs ${p.utilized_amount} Lakh`],
      ["Current Status", p.status],
      ["AI Risk Score", `${p.risk_score}/100 (${p.risk_level}) - ADVISORY ONLY`],
    ];

    doc.autoTable({
      startY: 48,
      body: info,
      theme: "plain",
      styles: { fontSize: 9, cellPadding: 2 },
      columnStyles: { 0: { fontStyle: "bold", cellWidth: 50 } },
    });

    let y = doc.lastAutoTable.finalY + 10;
    doc.setFontSize(12);
    doc.setFont("helvetica", "bold");
    doc.text("AI Forensic Analysis & Why Flagged?", 14, y);
    y += 6;

    if (p.factors.length === 0) {
      doc.setFont("helvetica", "normal");
      doc.setFontSize(10);
      doc.text("No anomaly signals detected by AI engine.", 14, y);
    } else {
      doc.autoTable({
        startY: y,
        head: [["Signal Type", "Contribution", "Detection Detail"]],
        body: p.factors.map((f) => [f.label, `+${f.contribution} pts`, f.detail]),
        theme: "striped",
        headStyles: { fillColor: [13, 71, 161], fontSize: 9 },
        styles: { fontSize: 8, cellPadding: 3 },
        columnStyles: { 0: { cellWidth: 45 }, 1: { cellWidth: 25 } },
      });
    }

    const finalY = doc.lastAutoTable?.finalY || y + 20;
    doc.setFontSize(9);
    doc.setTextColor(100);
    doc.text("⚠️ Note: AI flags are strictly advisory. Officer verification is final.", 14, finalY + 10);
    doc.text(`Report generated on ${new Date().toLocaleString()} for audit trail.`, 14, finalY + 16);

    doc.save(`PRAHARI-Report-${p.work_code}.pdf`);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <Link to="/projects" className="btn-outline inline-flex items-center gap-2 text-sm">
          <ArrowLeft size={16} /> Back to Projects
        </Link>
        <button onClick={exportPDF} className="btn-primary inline-flex items-center gap-2 text-sm">
          <Download size={16} /> Export PDF Report
        </button>
      </div>

      {/* Title & Risk Badge */}
      <div className="card p-6 flex flex-wrap items-start justify-between gap-4 border-l-4 border-l-indigo-700">
        <div>
          <div className="text-xs font-mono text-slate-500 mb-1">{p.work_code}</div>
          <h1 className="text-2xl font-bold text-slate-900">{p.name}</h1>
          <div className="mt-2 flex flex-wrap gap-2 text-xs">
            <span className={`chip rounded-full px-2.5 py-0.5 ${STATUS_CHIP[p.status]}`}>{p.status}</span>
            <span className="chip rounded-full px-2.5 py-0.5 bg-slate-100 text-slate-600">{p.category}</span>
            <span className="chip rounded-full px-2.5 py-0.5 bg-slate-100 text-slate-600 flex items-center gap-1">
              <MapPin size={10} /> {p.district} · {p.constituency}
            </span>
            <span className="chip rounded-full px-2.5 py-0.5 bg-slate-100 text-slate-600 flex items-center gap-1">
              <User size={10} /> MP: {p.mp}
            </span>
            <span className="chip rounded-full px-2.5 py-0.5 bg-slate-100 text-slate-600 flex items-center gap-1">
              <Building2 size={10} /> Vendor: {p.vendor}
            </span>
          </div>
        </div>
        <div className="flex items-center gap-3 bg-slate-50 px-4 py-3 rounded-lg border border-slate-200">
          <span className={`inline-block rounded-full px-4 py-2 text-xl font-extrabold ${RISK_BADGE[p.risk_level]}`}>
            {p.risk_score}/100
          </span>
          <div className="text-right">
            <div className="text-xs font-bold text-slate-700 uppercase tracking-wide">{p.risk_level} Risk</div>
            <div className="text-[10px] text-amber-600 font-semibold mt-0.5">⚠️ AI ADVISORY ONLY</div>
          </div>
        </div>
      </div>

      {/* Split Screen Layout */}
      <div className="grid lg:grid-cols-3 gap-6">
        
        {/* LEFT COLUMN: Official eSAKSHI Data (2/3 width) */}
        <div className="lg:col-span-2 space-y-4">
          
          {/* Financials Card */}
          <div className="card p-5">
            <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
              <IndianRupee size={18} className="text-indigo-700" /> Fund Utilisation Progress
            </h3>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-xs text-slate-600 mb-1">
                  <span>Sanctioned: ₹{p.sanctioned_amount}L</span>
                  <span>Released: ₹{p.released_amount}L ({releasedPct.toFixed(0)}%)</span>
                </div>
                <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                  <div className="h-2 bg-indigo-600 rounded-full" style={{ width: `${releasedPct}%` }} />
                </div>
              </div>
              <div>
                <div className="flex justify-between text-xs text-slate-600 mb-1">
                  <span>Released: ₹{p.released_amount}L</span>
                  <span>Utilised: ₹{p.utilized_amount}L ({utilPct.toFixed(0)}%)</span>
                </div>
                <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                  <div className={`h-2 rounded-full ${utilPct < 30 ? "bg-rose-500" : utilPct < 60 ? "bg-amber-500" : "bg-emerald-500"}`} 
                       style={{ width: `${utilPct}%` }} />
                </div>
              </div>
            </div>
          </div>

          {/* Anomaly Alerts Card */}
          <div className="card p-5">
            <div className="flex items-center gap-2 mb-4">
              <ShieldAlert size={18} className="text-rose-600" />
              <h3 className="font-bold text-slate-800">Explainable AI · Why Flagged?</h3>
            </div>
            
            {p.factors.length === 0 ? (
              <div className="rounded-lg bg-emerald-50 border border-emerald-200 p-4 flex items-center gap-3">
                <ShieldCheck size={20} className="text-emerald-600 shrink-0" />
                <p className="text-sm text-emerald-800 font-medium">No anomaly signals detected. This work appears clean across all 6 AI modules.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {p.factors.map((f, i) => (
                  <div key={i} className="rounded-lg bg-slate-50 border border-slate-200 p-4">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <span className={`h-3 w-3 rounded-full ${SIGNAL_META[f.signal].bar}`} />
                        <span className="font-bold text-sm text-slate-800">{f.label}</span>
                      </div>
                      <span className="text-xs font-bold bg-white border border-slate-200 px-2 py-0.5 rounded text-slate-700">
                        +{f.contribution} pts
                      </span>
                    </div>
                    <p className="text-sm text-slate-600 leading-relaxed">{f.detail}</p>
                    {f.evidence && f.evidence.length > 0 && (
                      <div className="mt-2 flex flex-wrap gap-1.5">
                        {f.evidence.map((ev, j) => (
                          <span key={j} className="text-[10px] bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded-full font-medium">
                            {ev}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div> 

          {/* 👇👇👇 ENHANCED COMPUTER VISION PANEL 👇👇👇 */}
          <EnhancedCVPanel project={p} />
          {/* 👆 END CV PANEL 👆👆 */}

        </div> 

        {/* RIGHT COLUMN: Verification & Metadata (1/3 width) */}
        <div className="space-y-4">
          
          {/* Timeline Metadata */}
          <div className="card p-5">
            <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
              <FileText size={18} className="text-indigo-700" /> Work Timeline
            </h3>
            <dl className="space-y-3 text-sm">
              <div className="flex justify-between border-b border-slate-100 pb-2">
                <dt className="text-slate-500">Sanction Date</dt>
                <dd className="font-medium text-slate-800">{fmtDate(p.sanction_date)}</dd>
              </div>
              <div className="flex justify-between border-b border-slate-100 pb-2">
                <dt className="text-slate-500">Start Date</dt>
                <dd className="font-medium text-slate-800">{fmtDate(p.start_date)}</dd>
              </div>
              <div className="flex justify-between border-b border-slate-100 pb-2">
                <dt className="text-slate-500">Planned Completion</dt>
                <dd className="font-medium text-slate-800">{fmtDate(p.planned_completion)}</dd>
              </div>
              <div className="flex justify-between border-b border-slate-100 pb-2">
                <dt className="text-slate-500">Actual Completion</dt>
                <dd className="font-medium text-slate-800">{fmtDate(p.actual_completion)}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-slate-500">UC Due Date</dt>
                <dd className="font-medium text-slate-800">{fmtDate(p.uc_due)}</dd>
              </div>
            </dl>
          </div>

          {/* Human-in-the-Loop Verification */}
          <div className="card p-5 border-t-4 border-t-indigo-700">
            <h3 className="font-bold text-slate-800 mb-3 flex items-center gap-2">
              <ShieldCheck size={18} className="text-indigo-700" /> Officer Decision
            </h3>
            
            {v.status === "pending" ? (
              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Decision Reason *</label>
                  <select 
                    className="input w-full text-sm"
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                  >
                    <option value="">Select reason...</option>
                    <option value="Confirmed Fraud">Confirmed Fraud / Ghost Asset</option>
                    <option value="Data Entry Error">False Positive - Data Error</option>
                    <option value="Legitimate Delay">False Positive - Legitimate Delay</option>
                    <option value="Geo-Tag Glitch">False Positive - GPS Glitch</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Remarks</label>
                  <textarea 
                    className="input w-full text-sm h-20 resize-none" 
                    placeholder="Add remarks for audit trail..."
                    value={remark}
                    onChange={(e) => setRemark(e.target.value)}
                  />
                </div>
                <div className="flex gap-2 pt-2">
                  <button disabled={busy} onClick={() => act("dismiss")} className="flex-1 btn-outline bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100 text-sm">
                    Dismiss
                  </button>
                  <button disabled={busy} onClick={() => act("confirm")} className="flex-1 btn-primary bg-rose-600 hover:bg-rose-700 text-sm">
                    Confirm
                  </button>
                </div>
              </div>
            ) : (
              <div className={`rounded-lg px-4 py-3 text-sm font-medium flex items-start gap-2 ${
                v.status === "confirmed" ? "bg-rose-50 text-rose-700 border border-rose-200" : "bg-emerald-50 text-emerald-700 border border-emerald-200"
              }`}>
                {v.status === "confirmed" ? <ShieldX size={16} className="shrink-0 mt-0.5"/> : <ShieldCheck size={16} className="shrink-0 mt-0.5"/>}
                <div>
                  <div className="font-bold">Flag {v.status === "confirmed" ? "Confirmed" : "Dismissed"}</div>
                  <div className="text-xs mt-1 opacity-80">By: {v.officer}</div>
                  <div className="text-xs opacity-80">At: {v.at}</div>
                  {v.remark && <div className="text-xs mt-1 italic opacity-90">"{v.remark}"</div>}
                </div>
              </div>
            )}
          </div>

        </div> 
      </div>
    </div>
  );
}