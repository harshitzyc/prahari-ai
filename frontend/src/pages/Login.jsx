import { useState } from "react";
import { ShieldCheck, Eye, EyeOff, LogIn, ArrowLeft, Lock, User, Sparkles } from "lucide-react";

const VALID_USERS = {
  nodal001: { password: "prahari", name: "Sri V. Nagaraj", role: "Nodal Officer", district: "Bengaluru Rural" },
  nodal002: { password: "prahari", name: "Smt. K. Manasa", role: "Nodal Officer", district: "Mysuru" },
  auditor001: { password: "prahari", name: "Sri R. Chandrashekar", role: "District Auditor", district: "Mandya" },
};

export default function Login({ onLogin, onBack }) {
  const [id, setId] = useState("");
  const [pass, setPass] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    // Simulate brief auth delay for smoothness
    setTimeout(() => {
      const user = VALID_USERS[id.trim().toLowerCase()];
      if (user && user.password === pass) {
        onLogin({ id: id.trim().toLowerCase(), ...user });
      } else {
        setError("Invalid Officer ID or Password. Please try again.");
        setLoading(false);
      }
    }, 600);
  };

  const quickFill = (uid) => {
    setId(uid);
    setPass("prahari");
    setError("");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Decorative background blobs */}
      <div className="absolute top-20 -left-20 w-72 h-72 bg-indigo-500/20 rounded-full blur-3xl" />
      <div className="absolute bottom-20 -right-20 w-96 h-96 bg-violet-500/20 rounded-full blur-3xl" />

      <div className="w-full max-w-md relative z-10 animate-[fadeIn_0.5s_ease-out]">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center bg-gradient-to-br from-indigo-500 to-indigo-700 rounded-2xl p-4 mb-4 shadow-2xl shadow-indigo-500/40">
            <ShieldCheck size={40} className="text-white" />
          </div>
          <h1 className="text-3xl font-bold text-white tracking-wide">PRAHARI</h1>
          <p className="text-indigo-300 text-sm mt-1">AI-Powered MPLADS Anomaly & Fraud Detection</p>
          <p className="text-slate-500 text-xs mt-1">SIH 2026 · PS 26102 · Team HexaCore</p>
        </div>

        {/* Login Card */}
        <div className="bg-white/10 backdrop-blur-xl rounded-2xl border border-white/20 p-8 shadow-2xl">
          <div className="flex items-center gap-2 mb-1">
            <Lock size={18} className="text-indigo-300" />
            <h2 className="text-lg font-semibold text-white">Officer Login</h2>
          </div>
          <p className="text-sm text-slate-400 mb-6">Access the verification & monitoring dashboard</p>

          <form onSubmit={submit} className="space-y-4">
            {/* Officer ID */}
            <div>
              <label className="block text-sm text-slate-300 mb-1.5 font-medium">Officer ID</label>
              <div className="relative">
                <User size={16} className="absolute left-3 top-3 text-slate-400" />
                <input
                  className="w-full rounded-lg bg-white/10 border border-white/20 pl-10 pr-4 py-2.5 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
                  placeholder="e.g. nodal001"
                  value={id}
                  autoComplete="username"
                  onChange={(e) => { setId(e.target.value); setError(""); }}
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm text-slate-300 mb-1.5 font-medium">Password</label>
              <div className="relative">
                <Lock size={16} className="absolute left-3 top-3 text-slate-400" />
                <input
                  type={showPass ? "text" : "password"}
                  className="w-full rounded-lg bg-white/10 border border-white/20 pl-10 pr-11 py-2.5 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
                  placeholder="Enter password"
                  value={pass}
                  autoComplete="current-password"
                  onChange={(e) => { setPass(e.target.value); setError(""); }}
                />
                <button
                  type="button"
                  onClick={() => setShowPass(!showPass)}
                  className="absolute right-3 top-2.5 text-slate-400 hover:text-white transition"
                  tabIndex={-1}
                >
                  {showPass ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {/* Error */}
            {error && (
              <div className="rounded-lg bg-rose-500/20 border border-rose-500/30 px-4 py-2.5 text-sm text-rose-200 flex items-center gap-2 animate-[shake_0.4s_ease-in-out]">
                <span>⚠️</span> {error}
              </div>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={loading || !id || !pass}
              className="w-full inline-flex items-center justify-center gap-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 disabled:bg-indigo-600/50 disabled:cursor-not-allowed text-white py-3 text-base font-semibold transition shadow-lg shadow-indigo-500/30 hover:shadow-indigo-500/50"
            >
              {loading ? (
                <>
                  <span className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Authenticating...
                </>
              ) : (
                <>
                  <LogIn size={18} /> Login as Nodal Officer
                </>
              )}
            </button>
          </form>

          {/* Demo Credentials */}
          <div className="mt-6 rounded-lg bg-indigo-500/10 border border-indigo-500/20 p-4">
            <p className="text-xs font-semibold text-indigo-300 mb-2 flex items-center gap-1">
              <Sparkles size={12} /> Demo Credentials (click to auto-fill)
            </p>
            <div className="space-y-1.5">
              {Object.entries(VALID_USERS).map(([uid, u]) => (
                <button
                  key={uid}
                  type="button"
                  onClick={() => quickFill(uid)}
                  className="w-full text-left rounded-md px-2.5 py-1.5 hover:bg-white/5 transition group"
                >
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-mono text-slate-200 group-hover:text-white">{uid}</span>
                    <span className="text-slate-500">{u.role} · {u.district}</span>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Back to Citizen Portal */}
          {onBack && (
            <button
              type="button"
              onClick={onBack}
              className="mt-5 w-full text-sm text-slate-400 hover:text-white transition flex items-center justify-center gap-1.5 py-2 rounded-lg hover:bg-white/5"
            >
              <ArrowLeft size={14} /> Back to Citizen Portal
            </button>
          )}
        </div>

        {/* Footer note */}
        <p className="text-center text-xs text-slate-600 mt-6">
          🔒 RBAC + Aadhaar e-KYC in production · Mock login for demonstration
        </p>
      </div>

      {/* Inline keyframes for animations */}
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-4px); }
          75% { transform: translateX(4px); }
        }
      `}</style>
    </div>
  );
}