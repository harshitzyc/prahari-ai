import { useState } from "react";
import { 
  ShieldCheck, Search, Users, Globe, AlertTriangle, CheckCircle2, 
  FileText, MessageCircle, Mic, ZoomIn, ZoomOut, Type, ArrowRight, 
  Eye, Phone 
} from "lucide-react";
import CitizenChatbot from "../components/CitizenChatbot";

export default function CitizenHome({ onGoToLogin }) {
  const [lookupCode, setLookupCode] = useState("");
  const [lookupResult, setLookupResult] = useState(null);
  const [fontSize, setFontSize] = useState(16); // Accessibility font size
  const [lang, setLang] = useState("English");
  const [showReportModal, setShowReportModal] = useState(false);
  const [reportTicket, setReportTicket] = useState("");

  const handleLookup = () => {
    if (!lookupCode.trim()) return;
    setLookupResult({
      code: lookupCode.toUpperCase(),
      name: "CC Road from Hirehalli to Devanur",
      status: "Completed",
      location: "Hirehalli, Mysuru District",
      sanctioned: "₹18.5 Lakh",
      note: "For detailed AI risk analysis, please login as a Nodal Officer.",
    });
  };

  const handleReport = () => {
    // Mock ticket generation for the Citizen Verification Loop
    const ticket = `PRAHARI-${Math.floor(1000 + Math.random() * 9000)}`;
    setReportTicket(ticket);
    setShowReportModal(true);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col" style={{ fontSize: `${fontSize}px` }}>
      
      {/* ================= HEADER ================= */}
      <header className="bg-white shadow-sm sticky top-0 z-40">
        {/* Top Accessibility Bar (Govt Standard) */}
        <div className="bg-slate-900 text-slate-300 text-[11px] py-1.5 px-6 flex justify-between items-center">
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1 hover:text-white cursor-pointer"><Eye size={12} /> Screen Reader</span>
            <span className="flex items-center gap-1 hover:text-white cursor-pointer"><Phone size={12} /> Helpline: 1800-11-2200</span>
          </div>
          <div className="flex items-center gap-3">
            <button onClick={() => setFontSize(Math.max(12, fontSize - 2))} className="hover:text-white font-bold">A-</button>
            <button onClick={() => setFontSize(16)} className="hover:text-white font-bold">A</button>
            <button onClick={() => setFontSize(Math.min(24, fontSize + 2))} className="hover:text-white font-bold">A+</button>
            <div className="h-3 w-px bg-slate-700 mx-1"></div>
            <button className="hover:text-white">Skip to Main Content</button>
          </div>
        </div>

        {/* Tricolor Accent Strip */}
        <div className="h-1 w-full bg-gradient-to-r from-orange-500 via-white to-green-600 border-b border-slate-200"></div>

        {/* Main Navigation */}
        <div className="px-6 py-3 flex items-center justify-between max-w-7xl mx-auto w-full">
          <div className="flex items-center gap-3">
            {/* Mock Gov Logo */}
            <div className="h-12 w-12 bg-slate-100 rounded-full flex items-center justify-center border border-slate-200">
              <ShieldCheck size={24} className="text-indigo-700" />
            </div>
            <div>
              <h1 className="font-bold text-slate-900 text-xl leading-tight tracking-tight">PRAHARI</h1>
              <p className="text-[11px] text-slate-500 font-medium">MPLADS Citizen Oversight Portal | Ministry of Statistics & Programme Implementation</p>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            {/* Language Toggle */}
            <div className="relative">
              <Globe size={16} className="absolute left-3 top-2.5 text-slate-400" />
              <select 
                value={lang} 
                onChange={(e) => setLang(e.target.value)}
                className="bg-slate-100 border border-slate-200 rounded-md pl-9 pr-3 py-2 text-sm font-medium text-slate-700 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none cursor-pointer"
              >
                <option>English</option>
                <option>हिन्दी (Hindi)</option>
                <option>ಕನ್ನಡ (Kannada)</option>
              </select>
            </div>
            
            <button 
              onClick={onGoToLogin} 
              className="bg-indigo-700 hover:bg-indigo-800 text-white text-sm font-semibold px-5 py-2 rounded-md transition shadow-sm flex items-center gap-2"
            >
              <Users size={16} /> Officer Login
            </button>
          </div>
        </div>
      </header>

      {/* ================= HERO SECTION ================= */}
      <section className="bg-gradient-to-br from-indigo-50 via-white to-slate-50 py-16 px-6 border-b border-slate-200">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 bg-indigo-100 text-indigo-800 rounded-full px-4 py-1.5 text-xs font-bold mb-6 uppercase tracking-wider">
            <Globe size={14} /> Open to All Citizens · No Login Required
          </div>
          <h1 className="text-4xl md:text-5xl font-extrabold text-slate-900 tracking-tight mb-4">
            Track & Verify MPLADS Works <br />
            <span className="text-indigo-700">In Your Constituency</span>
          </h1>
          <p className="text-lg text-slate-600 max-w-2xl mx-auto mb-8">
            Ask our AI assistant about any MPLADS project, check fund utilization, or report suspicious works anonymously. 
            Available in English, Hindi, and Kannada.
          </p>

          {/* Search Bar */}
          <div className="max-w-2xl mx-auto relative">
            <Search size={20} className="absolute left-4 top-4 text-slate-400" />
            <input
              className="w-full rounded-xl border border-slate-300 pl-12 pr-14 py-4 text-base shadow-lg focus:ring-4 focus:ring-indigo-100 focus:border-indigo-500 outline-none transition"
              placeholder="Enter Work Code (e.g., PRJ-1017) or Village Name..."
              value={lookupCode}
              onChange={(e) => setLookupCode(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleLookup()}
            />
            <button className="absolute right-3 top-3 p-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-600 transition" title="Voice Search">
              <Mic size={20} />
            </button>
          </div>
        </div>
      </section>

      {/* ================= LIVE IMPACT TICKER ================= */}
      <section className="bg-white border-b border-slate-200 py-8 px-6">
        <div className="max-w-6xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
          <div>
            <div className="text-3xl font-extrabold text-indigo-700">12,450</div>
            <div className="text-xs text-slate-500 uppercase tracking-wide font-semibold mt-1">Works Monitored</div>
          </div>
          <div>
            <div className="text-3xl font-extrabold text-emerald-600">₹14.2 Cr</div>
            <div className="text-xs text-slate-500 uppercase tracking-wide font-semibold mt-1">Funds Protected</div>
          </div>
          <div>
            <div className="text-3xl font-extrabold text-rose-600">342</div>
            <div className="text-xs text-slate-500 uppercase tracking-wide font-semibold mt-1">Ghost Assets Flagged</div>
          </div>
          <div>
            <div className="text-3xl font-extrabold text-amber-600">543</div>
            <div className="text-xs text-slate-500 uppercase tracking-wide font-semibold mt-1">Constituencies Covered</div>
          </div>
        </div>
      </section>

      {/* ================= MAIN CONTENT ================= */}
      <main className="flex-1 max-w-6xl mx-auto w-full px-6 py-12 grid md:grid-cols-2 gap-8">
        
        {/* Left: Public Project Lookup */}
        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
          <div className="flex items-center gap-2 mb-4">
            <div className="bg-indigo-100 p-2 rounded-lg"><Search className="text-indigo-700" size={20} /></div>
            <h2 className="font-bold text-lg text-slate-900">Public Project Lookup</h2>
          </div>
          <p className="text-sm text-slate-600 mb-4">
            Enter a work code to see basic public information. Detailed AI risk analysis is available to authorised Nodal Officers only.
          </p>
          
          {lookupResult && (
            <div className="mt-4 rounded-lg bg-slate-50 border border-slate-200 p-4 animate-[fadeIn_0.3s_ease-out]">
              <div className="font-bold text-slate-900">{lookupResult.name}</div>
              <div className="text-xs font-mono text-slate-500 mt-1">{lookupResult.code}</div>
              <dl className="mt-3 space-y-2 text-sm text-slate-700">
                <div className="flex justify-between border-b border-slate-200 pb-1"><dt className="text-slate-500">Status:</dt><dd className="font-semibold text-emerald-700">{lookupResult.status}</dd></div>
                <div className="flex justify-between border-b border-slate-200 pb-1"><dt className="text-slate-500">Location:</dt><dd>{lookupResult.location}</dd></div>
                <div className="flex justify-between"><dt className="text-slate-500">Sanctioned:</dt><dd className="font-semibold">{lookupResult.sanctioned}</dd></div>
              </dl>
              <div className="mt-4 text-xs text-amber-800 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2 flex items-start gap-2">
                <ShieldCheck size={14} className="shrink-0 mt-0.5" />
                <span>{lookupResult.note}</span>
              </div>
            </div>
          )}
        </div>

        {/* Right: What You Can Do */}
        <div className="space-y-4">
          <h2 className="font-bold text-lg text-slate-900 mb-2">How Citizens Can Use PRAHARI</h2>
          
          <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm flex gap-4 hover:shadow-md transition">
            <MessageCircle className="text-indigo-700 shrink-0 mt-1" size={24} />
            <div>
              <h3 className="font-bold text-slate-900">Ask the AI Assistant</h3>
              <p className="text-sm text-slate-600 mt-1">Query any project in your constituency in English, Hindi, or Kannada.</p>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm flex gap-4 hover:shadow-md transition">
            <FileText className="text-indigo-700 shrink-0 mt-1" size={24} />
            <div>
              <h3 className="font-bold text-slate-900">Verify Asset Existence</h3>
              <p className="text-sm text-slate-600 mt-1">Check geo-tagged photos and GPS locations to ensure the work actually exists.</p>
            </div>
          </div>

          {/* Report an Issue Card (Citizen Verification Loop) */}
          <div className="bg-rose-50 rounded-xl border border-rose-200 p-5 shadow-sm flex gap-4 hover:shadow-md transition border-l-4 border-l-rose-500">
            <AlertTriangle className="text-rose-600 shrink-0 mt-1" size={24} />
            <div className="flex-1">
              <h3 className="font-bold text-slate-900">Report a Suspicious Work</h3>
              <p className="text-sm text-slate-600 mt-1">
                Saw a fake photo, ghost asset, or stalled construction? Report it anonymously.
              </p>
              <button 
                onClick={handleReport}
                className="mt-3 bg-rose-600 hover:bg-rose-700 text-white text-sm font-bold px-4 py-2 rounded-lg transition flex items-center gap-2"
              >
                Start Anonymous Report <ArrowRight size={14} />
              </button>
            </div>
          </div>
        </div>
      </main>

      {/* ================= FOOTER ================= */}
      <footer className="bg-slate-900 text-slate-400 py-8 px-6 mt-auto">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4 text-xs">
          <div className="text-center md:text-left">
            <p className="font-semibold text-white">PRAHARI · SIH 2026 · PS 26102</p>
            <p className="mt-1">Built by Team HexaCore · AI-powered oversight for MPLADS</p>
          </div>
          <div className="flex gap-6">
            <span className="hover:text-white cursor-pointer">Privacy Policy</span>
            <span className="hover:text-white cursor-pointer">Terms of Use</span>
            <span className="hover:text-white cursor-pointer">Contact Us</span>
          </div>
        </div>
      </footer>

      {/* ================= FLOATING CHATBOT ================= */}
      <CitizenChatbot />

      {/* ================= MOCK REPORT MODAL ================= */}
      {showReportModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 animate-[fadeIn_0.2s_ease-out]">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="bg-emerald-100 p-2 rounded-full">
                <CheckCircle2 className="text-emerald-600" size={24} />
              </div>
              <h3 className="text-lg font-bold text-slate-900">Report Submitted Successfully</h3>
            </div>
            <p className="text-sm text-slate-600 mb-4">
              Thank you for helping us maintain transparency. Your report has been securely logged.
            </p>
            <div className="bg-slate-50 border border-slate-200 rounded-lg p-4 mb-6">
              <div className="text-xs text-slate-500 uppercase tracking-wide font-semibold">Your Tracking ID</div>
              <div className="text-xl font-mono font-bold text-indigo-700 mt-1">{reportTicket}</div>
            </div>
            
            {/* Mock Progress Tracker */}
            <div className="flex items-center justify-between text-[10px] font-bold text-slate-500 mb-2">
              <span className="text-emerald-600">SUBMITTED</span>
              <span className="text-indigo-600">AI VERIFYING</span>
              <span>OFFICER REVIEW</span>
            </div>
            <div className="h-1.5 bg-slate-200 rounded-full overflow-hidden mb-6">
              <div className="h-full bg-gradient-to-r from-emerald-500 to-indigo-500 w-1/2"></div>
            </div>

            <button 
              onClick={() => setShowReportModal(false)} 
              className="w-full bg-slate-900 hover:bg-slate-800 text-white font-semibold py-2.5 rounded-lg transition"
            >
              Close
            </button>
          </div>
        </div>
      )}

      <style>{`
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
      `}</style>
    </div>
  );
}