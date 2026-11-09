import { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Upload, FileText, AlertTriangle, CheckCircle2, Download, Loader2, X, ArrowRight } from "lucide-react";
import { RISK_BADGE, SIGNAL_META, fmtMoney } from "../utils";

export default function DataUpload() {
  const navigate = useNavigate();
  const [file, setFile] = useState(null);
  const [dragging, setDragging] = useState(false);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");
  const inputRef = useRef(null);

  const upload = async (f) => {
    if (!f) return;
    setFile(f);
    setLoading(true);
    setError("");
    setResult(null);

    const form = new FormData();
    form.append("file", f);

    try {
      const res = await fetch("http://localhost:8000/api/upload", {
        method: "POST",
        body: form,
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({ detail: "Upload failed" }));
        throw new Error(err.detail || "Upload failed");
      }
      const data = await res.json();
      setResult(data);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  const onDrop = (e) => {
    e.preventDefault();
    setDragging(false);
    const f = e.dataTransfer.files[0];
    if (f && f.name.endsWith(".csv")) upload(f);
    else setError("Please upload a valid CSV file");
  };

  const reset = () => {
    setFile(null);
    setResult(null);
    setError("");
  };

  const downloadSample = () => {
    const link = document.createElement("a");
    link.href = "/sample_data.csv";
    link.download = "sample_mplads_data.csv";
    link.click();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-xl font-bold text-slate-900">Live Data Ingestion & AI Scoring</h2>
        <p className="text-sm text-slate-500 mt-1">
          Upload a CSV of MPLADS works. PRAHARI's CV, NLP, and financial engines will score each project for fraud, anomaly & inefficiency risk in real-time.
        </p>
      </div>

      {/* Upload Area */}
      {!result && (
        <div
          onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
          onDragLeave={() => setDragging(false)}
          onDrop={onDrop}
          onClick={() => inputRef.current?.click()}
          className={`card p-12 text-center cursor-pointer transition-all duration-200 ${
            dragging 
              ? "border-indigo-500 bg-indigo-50/50 scale-[1.01]" 
              : "hover:bg-slate-50 border-dashed border-2 border-slate-300 hover:border-indigo-400"
          }`}
        >
          <input
            ref={inputRef}
            type="file"
            accept=".csv"
            className="hidden"
            onChange={(e) => upload(e.target.files[0])}
          />
          {loading ? (
            <>
              <Loader2 size={48} className="mx-auto text-indigo-600 animate-spin mb-4" />
              <p className="font-semibold text-slate-700 text-lg">Analyzing {file?.name}…</p>
              <p className="text-sm text-slate-500 mt-2">Running DSR benchmarking, Geo-fencing, Image Hashing & Vendor Network checks</p>
            </>
          ) : (
            <>
              <div className="inline-flex items-center justify-center bg-indigo-100 rounded-full p-4 mb-4">
                <Upload size={32} className="text-indigo-600" />
              </div>
              <p className="font-semibold text-slate-700 text-lg">
                Drop your CSV file here, or <span className="text-indigo-600 underline">click to browse</span>
              </p>
              <p className="text-sm text-slate-500 mt-2 max-w-md mx-auto">
                Expected format: work_code, name, category, district, cost_per_unit, dsr_benchmark, status, photo_hash, photo_distance_km, image_url...
              </p>
              <button
                onClick={(e) => { e.stopPropagation(); downloadSample(); }}
                className="mt-6 btn-outline text-sm inline-flex items-center gap-2"
              >
                <Download size={14} /> Download Sample CSV with Anomalies
              </button>
            </>
          )}
        </div>
      )}

      {/* Error State */}
      {error && (
        <div className="card p-4 bg-rose-50 border border-rose-200 text-rose-700 flex items-start gap-3">
          <AlertTriangle size={20} className="shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="font-semibold">Upload Failed</p>
            <p className="text-sm mt-1">{error}</p>
          </div>
          <button onClick={reset} className="text-rose-500 hover:text-rose-700"><X size={18} /></button>
        </div>
      )}

      {/* Results Section */}
      {result && (
        <>
          {/* Summary Cards */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <div className="card p-4">
              <div className="text-xs text-slate-500 uppercase tracking-wide font-medium">Total Works</div>
              <div className="text-2xl font-bold text-slate-800 mt-1">{result.summary.total_works}</div>
            </div>
            <div className="card p-4 bg-rose-50 border border-rose-200">
              <div className="text-xs text-rose-600 uppercase tracking-wide font-medium">High Risk</div>
              <div className="text-2xl font-bold text-rose-700 mt-1">{result.summary.high_risk}</div>
            </div>
            <div className="card p-4 bg-amber-50 border border-amber-200">
              <div className="text-xs text-amber-600 uppercase tracking-wide font-medium">Medium Risk</div>
              <div className="text-2xl font-bold text-amber-700 mt-1">{result.summary.medium_risk}</div>
            </div>
            <div className="card p-4 bg-emerald-50 border border-emerald-200">
              <div className="text-xs text-emerald-600 uppercase tracking-wide font-medium">Low Risk</div>
              <div className="text-2xl font-bold text-emerald-700 mt-1">{result.summary.low_risk}</div>
            </div>
            <div className="card p-4">
              <div className="text-xs text-slate-500 uppercase tracking-wide font-medium">Total Sanctioned</div>
              <div className="text-2xl font-bold text-slate-800 mt-1">₹{result.summary.total_sanctioned_cr} Cr</div>
            </div>
          </div>

          {/* Results Table */}
          <div className="card overflow-hidden">
            <div className="p-4 border-b border-slate-200 flex items-center justify-between bg-slate-50/50">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="text-emerald-600" size={18} />
                <h3 className="font-semibold text-slate-800">AI Risk Analysis Complete</h3>
              </div>
              <button onClick={reset} className="btn-outline text-sm inline-flex items-center gap-2">
                <Upload size={14} /> Upload Another File
              </button>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-xs text-slate-500 border-b border-slate-200 bg-slate-50 uppercase tracking-wider">
                    <th className="p-4 font-semibold">Work Code</th>
                    <th className="p-4 font-semibold">Project Name</th>
                    <th className="p-4 font-semibold">District</th>
                    <th className="p-4 font-semibold">Status</th>
                    <th className="p-4 font-semibold">Sanctioned</th>
                    <th className="p-4 font-semibold">Risk Score</th>
                    <th className="p-4 font-semibold">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {result.projects.map((p) => (
                    <tr key={p.id} className="hover:bg-slate-50 transition-colors">
                      <td className="p-4 font-mono text-xs text-slate-600 whitespace-nowrap">{p.work_code}</td>
                      <td className="p-4 max-w-[280px] truncate font-medium text-slate-800" title={p.name}>{p.name}</td>
                      <td className="p-4 text-slate-600">{p.district}</td>
                      <td className="p-4">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-700">
                          {p.status}
                        </span>
                      </td>
                      <td className="p-4 text-slate-600">{fmtMoney(p.sanctioned_amount)}</td>
                      <td className="p-4">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold ${RISK_BADGE[p.risk_level]}`}>
                          {p.risk_score}/100
                        </span>
                      </td>
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          {p.factors.length > 0 ? (
                            <button 
                              onClick={() => navigate(`/projects/${p.id}`)} 
                              className="text-xs text-indigo-600 hover:text-indigo-800 font-medium flex items-center gap-1 hover:underline"
                            >
                              View Full Analysis <ArrowRight size={12} />
                            </button>
                          ) : (
                            <span className="text-xs text-emerald-600 font-medium flex items-center gap-1">
                              <CheckCircle2 size={12} /> Clean
                            </span>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
          
          <p className="text-xs text-slate-400 text-center pt-2">
            Note: Click "View Full Analysis" to see Computer Vision forensics, EXIF validation, and detailed SHAP explanations.
          </p>
        </>
      )}
    </div>
  );
}