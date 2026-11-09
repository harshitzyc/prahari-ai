import { useState, useRef, useEffect } from "react";
import { MessageCircle, X, Send, Globe, Bot, User } from "lucide-react";
import { get } from "../api";

const QUICK_REPLIES = [
  "🛣️ Show road works in my area",
  "📍 Check a project by code",
  "📊 Fund utilization status",
  "⚠️ Report a suspicious work",
];

const BOT_RESPONSES = {
  greeting: {
    en: "🙏 Namaste! I am PRAHARI Citizen Assistant. Ask me about any MPLADS work in your constituency — I can check status, location, and fund utilization.",
    hi: "🙏 नमस्ते! मैं प्रहारी नागरिक सहायक हूं। अपने क्षेत्र के किसी भी MPLADS कार्य के बारे में पूछें।"
  },
  road: {
    en: "🛣️ Here are the road works in your constituency:\n\n• CC Road Hirehalli–Devanur (PRJ-1002) — ₹18.5L — ✅ Completed\n• BT Road widening Kaglipur (PRJ-1015) — ₹22.3L — ⚠️ Flagged (cost inflated 45%)\n• Approach road to Belakere lake (PRJ-1028) — ₹16.8L — 🔄 In Progress\n\nTap any project code to see details.",
    hi: "🛣️ आपके क्षेत्र में सड़क कार्य:\n\n• CC Road Hirehalli–Devanur (PRJ-1002) — ₹18.5L — ✅ पूर्ण\n• BT Road widening Kaglipur (PRJ-1015) — ₹22.3L — ⚠️ फ्लैग किया गया\n• Approach road to Belakere lake (PRJ-1028) — ₹16.8L — 🔄 प्रगति में"
  },
  check: {
    en: "📍 Please enter the work code (e.g., PRJ-1017 or MPLADS-KA-2024-1017). I'll fetch the current status, location, and AI risk score for you.",
    hi: "📍 कृपया कार्य कोड दर्ज करें (जैसे PRJ-1017)। मैं वर्तमान स्थिति, स्थान और AI जोखिम स्कोर दिखाऊंगा।"
  },
  fund: {
    en: "📊 Your constituency fund status:\n\n• Total Sanctioned: ₹4.8 Cr\n• Released: ₹3.2 Cr (67%)\n• Utilised: ₹2.1 Cr (66% of released)\n• UC Pending: ₹0.9 Cr\n\n⚠️ 3 works have overdue UCs. Tap 'Verification' for details.",
    hi: "📊 आपके क्षेत्र की निधि स्थिति:\n\n• कुल स्वीकृत: ₹4.8 Cr\n• जारी: ₹3.2 Cr (67%)\n• उपयोग: ₹2.1 Cr (66%)\n• UC लंबित: ₹0.9 Cr"
  },
  report: {
    en: "⚠️ To report a suspicious work, please share:\n\n1. Work code (if known)\n2. Village/constituency name\n3. Issue type (ghost work / duplicate photo / inflated cost / stalled)\n\nOur AI will cross-verify and the nodal officer will review within 48 hours.",
    hi: "⚠️ संदिग्ध कार्य की रिपोर्ट करने के लिए कृपया साझा करें:\n\n1. कार्य कोड\n2. गाँव/क्षेत्र का नाम\n3. समस्या प्रकार\n\nहमारा AI 48 घंटे में सत्यापित करेगा।"
  },
  unknown: {
    en: "I'm not sure about that. Try asking about:\n• Road/water/education works\n• Project status by code\n• Fund utilization\n• Report a suspicious work",
    hi: "मुझे इस बारे में जानकारी नहीं है। इनके बारे में पूछें:\n• सड़क/पानी/शिक्षा कार्य\n• कार्य कोड से स्थिति\n• निधि उपयोग"
  }
};

function classifyQuery(text) {
  const t = text.toLowerCase();
  if (/road|pathway|cc road|bt road|path/.test(t)) return "road";
  if (/check|code|prj-|status|location/.test(t)) return "check";
  if (/fund|utili|uc|spent|release|sanction/.test(t)) return "fund";
  if (/report|suspicious|fraud|ghost|complain|flag/.test(t)) return "report";
  return "unknown";
}

export default function CitizenChatbot() {
  const [open, setOpen] = useState(false);
  const [lang, setLang] = useState("en");
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [typing, setTyping] = useState(false);
  const endRef = useRef(null);

  useEffect(() => {
    if (open && messages.length === 0) {
      setMessages([{ from: "bot", text: BOT_RESPONSES.greeting[lang], time: new Date() }]);
    }
  }, [open]);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, typing]);

  const send = (text) => {
    if (!text?.trim()) return;
    const userMsg = { from: "user", text, time: new Date() };
    setMessages((m) => [...m, userMsg]);
    setInput("");
    setTyping(true);

    setTimeout(() => {
      const key = classifyQuery(text);
      setMessages((m) => [...m, { from: "bot", text: BOT_RESPONSES[key][lang], time: new Date() }]);
      setTyping(false);
    }, 900);
  };

  return (
    <>
      {/* Floating Button */}
      {!open && (
        <button onClick={() => setOpen(true)}
          className="fixed bottom-6 right-6 z-50 bg-indigo-600 hover:bg-indigo-700 text-white rounded-full p-4 shadow-2xl shadow-indigo-500/40 transition hover:scale-105 flex items-center gap-2">
          <MessageCircle size={22} />
          <span className="hidden sm:inline font-medium text-sm pr-1">Ask PRAHARI</span>
          <span className="absolute -top-1 -right-1 bg-rose-500 text-white text-[10px] font-bold rounded-full h-5 w-5 flex items-center justify-center animate-pulse">
            AI
          </span>
        </button>
      )}

      {/* Chat Window */}
      {open && (
        <div className="fixed bottom-6 right-6 z-50 w-[calc(100vw-3rem)] sm:w-96 h-[600px] max-h-[calc(100vh-3rem)] card shadow-2xl flex flex-col overflow-hidden border border-slate-200">
          {/* Header */}
          <div className="bg-gradient-to-r from-indigo-600 to-indigo-700 text-white px-4 py-3 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="bg-white/20 rounded-full p-1.5">
                <Bot size={18} />
              </div>
              <div>
                <div className="font-semibold text-sm">PRAHARI Citizen Assistant</div>
                <div className="text-[10px] text-indigo-200">Multilingual · AI-Powered</div>
              </div>
            </div>
            <div className="flex items-center gap-1">
              <button onClick={() => setLang(lang === "en" ? "hi" : "en")}
                className="p-1.5 rounded hover:bg-white/20 text-xs font-medium flex items-center gap-1" title="Toggle language">
                <Globe size={14} /> {lang === "en" ? "हिं" : "EN"}
              </button>
              <button onClick={() => setOpen(false)} className="p-1.5 rounded hover:bg-white/20">
                <X size={18} />
              </button>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-slate-50">
            {messages.map((m, i) => (
              <div key={i} className={`flex gap-2 ${m.from === "user" ? "justify-end" : "justify-start"}`}>
                {m.from === "bot" && (
                  <div className="shrink-0 bg-indigo-100 text-indigo-700 rounded-full p-1.5 h-7 w-7 flex items-center justify-center">
                    <Bot size={14} />
                  </div>
                )}
                <div className={`max-w-[75%] rounded-2xl px-3 py-2 text-sm whitespace-pre-line ${
                  m.from === "user"
                    ? "bg-indigo-600 text-white rounded-br-sm"
                    : "bg-white text-slate-700 border border-slate-200 rounded-bl-sm"
                }`}>
                  {m.text}
                </div>
                {m.from === "user" && (
                  <div className="shrink-0 bg-slate-200 text-slate-700 rounded-full p-1.5 h-7 w-7 flex items-center justify-center">
                    <User size={14} />
                  </div>
                )}
              </div>
            ))}
            {typing && (
              <div className="flex gap-2">
                <div className="shrink-0 bg-indigo-100 text-indigo-700 rounded-full p-1.5 h-7 w-7 flex items-center justify-center">
                  <Bot size={14} />
                </div>
                <div className="bg-white border border-slate-200 rounded-2xl rounded-bl-sm px-3 py-2 flex gap-1">
                  <span className="h-2 w-2 rounded-full bg-slate-400 animate-bounce" style={{ animationDelay: "0ms" }} />
                  <span className="h-2 w-2 rounded-full bg-slate-400 animate-bounce" style={{ animationDelay: "150ms" }} />
                  <span className="h-2 w-2 rounded-full bg-slate-400 animate-bounce" style={{ animationDelay: "300ms" }} />
                </div>
              </div>
            )}
            <div ref={endRef} />
          </div>

          {/* Quick Replies */}
          {messages.length < 3 && (
            <div className="px-4 py-2 bg-white border-t border-slate-100 flex flex-wrap gap-1.5">
              {QUICK_REPLIES.map((q) => (
                <button key={q} onClick={() => send(q)}
                  className="text-xs bg-indigo-50 text-indigo-700 hover:bg-indigo-100 rounded-full px-3 py-1 transition">
                  {q}
                </button>
              ))}
            </div>
          )}

          {/* Input */}
          <div className="p-3 bg-white border-t border-slate-200 flex gap-2">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && send(input)}
              placeholder={lang === "en" ? "Ask about any MPLADS work..." : "किसी MPLADS कार्य के बारे में पूछें..."}
              className="flex-1 rounded-full border border-slate-300 px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
            <button onClick={() => send(input)} disabled={!input.trim()}
              className="bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white rounded-full p-2 transition">
              <Send size={16} />
            </button>
          </div>
        </div>
      )}
    </>
  );
}