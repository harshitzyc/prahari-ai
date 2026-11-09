import { useState } from "react";
import { ShieldCheck, Users, Globe, Eye, Phone, ZoomIn, ZoomOut } from "lucide-react";

export default function GovHeader({ isOfficer, user, onLogout, onGoToLogin }) {
  const [fontSize, setFontSize] = useState(16);

  return (
    <header className="bg-white shadow-sm sticky top-0 z-40" style={{ fontSize: `${fontSize}px` }}>
      {/* 1. GIGW Black Accessibility Bar */}
      <div className="bg-slate-900 text-slate-300 text-[11px] py-1.5 px-6 flex justify-between items-center">
        <div className="flex items-center gap-4">
          <span className="flex items-center gap-1 hover:text-white cursor-pointer"><Eye size={12} /> Screen Reader</span>
          <span className="flex items-center gap-1 hover:text-white cursor-pointer"><Phone size={12} /> Helpline: 1800-11-2200</span>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={() => setFontSize(Math.max(12, fontSize - 2))} className="hover:text-white font-bold flex items-center gap-1"><ZoomOut size={10}/> A-</button>
          <button onClick={() => setFontSize(16)} className="hover:text-white font-bold">A</button>
          <button onClick={() => setFontSize(Math.min(24, fontSize + 2))} className="hover:text-white font-bold flex items-center gap-1"><ZoomIn size={10}/> A+</button>
          <div className="h-3 w-px bg-slate-700 mx-1"></div>
          <button className="hover:text-white">Skip to Main Content</button>
        </div>
      </div>

      {/* 2. Tricolor Accent Strip */}
      <div className="h-1 w-full bg-gradient-to-r from-orange-500 via-white to-green-600 border-b border-slate-200"></div>

      {/* 3. Main Navigation */}
      <div className="px-6 py-3 flex items-center justify-between max-w-7xl mx-auto w-full">
        <div className="flex items-center gap-3">
          <div className="h-12 w-12 bg-slate-100 rounded-full flex items-center justify-center border border-slate-200">
            <ShieldCheck size={24} className="text-indigo-700" />
          </div>
          <div>
            <h1 className="font-bold text-slate-900 text-xl leading-tight tracking-tight">PRAHARI</h1>
            <p className="text-[11px] text-slate-500 font-medium">MPLADS AI Oversight Portal | Ministry of Statistics & Programme Implementation</p>
          </div>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="relative">
            <Globe size={16} className="absolute left-3 top-2.5 text-slate-400" />
            <select className="bg-slate-100 border border-slate-200 rounded-md pl-9 pr-3 py-2 text-sm font-medium text-slate-700 focus:ring-2 focus:ring-indigo-500 outline-none cursor-pointer">
              <option>English</option>
              <option>हिन्दी (Hindi)</option>
              <option>ಕನ್ನಡ (Kannada)</option>
            </select>
          </div>
          
          {isOfficer ? (
            <div className="flex items-center gap-3">
              <div className="text-right hidden md:block">
                <div className="text-sm font-semibold text-slate-800">{user?.name}</div>
                <div className="text-[11px] text-slate-500">{user?.role} · {user?.district}</div>
              </div>
              <button onClick={onLogout} className="bg-slate-800 hover:bg-slate-900 text-white text-sm font-semibold px-4 py-2 rounded-md transition flex items-center gap-2">
                <Users size={16} /> Logout
              </button>
            </div>
          ) : (
            <button onClick={onGoToLogin} className="bg-indigo-700 hover:bg-indigo-800 text-white text-sm font-semibold px-5 py-2 rounded-md transition shadow-sm flex items-center gap-2">
              <Users size={16} /> Officer Login
            </button>
          )}
        </div>
      </div>
    </header>
  );
}