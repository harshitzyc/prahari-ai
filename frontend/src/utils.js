export const fmtMoney = (lakh) => {
  if (lakh == null) return "—";
  return lakh >= 100 ? `₹${(lakh / 100).toFixed(2)} Cr` : `₹${Number(lakh).toFixed(1)} L`;
};

export const fmtDate = (s) =>
  s ? new Date(s).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" }) : "—";

export const RISK_BADGE = {
  High: "bg-rose-100 text-rose-700 border border-rose-200",
  Medium: "bg-amber-100 text-amber-700 border border-amber-200",
  Low: "bg-emerald-100 text-emerald-700 border border-emerald-200",
};

export const RISK_DOT = { High: "#e11d48", Medium: "#f59e0b", Low: "#10b981" };

export const SIGNAL_META = {
  financial: { label: "Financial / DSR", bar: "bg-rose-500",    hex: "#f43f5e", chip: "bg-rose-50 text-rose-700" },
  visual:    { label: "Image Forensics", bar: "bg-violet-500", hex: "#8b5cf6", chip: "bg-violet-50 text-violet-700" },
  geo:       { label: "Geo-spatial",     bar: "bg-sky-500",    hex: "#0ea5e9", chip: "bg-sky-50 text-sky-700" },
  temporal:  { label: "Timeline / Funds",bar: "bg-amber-500",  hex: "#f59e0b", chip: "bg-amber-50 text-amber-700" },
  network:   { label: "Vendor Network",  bar: "bg-emerald-500",hex: "#10b981", chip: "bg-emerald-50 text-emerald-700" },
  textual:   { label: "Document / NLP",  bar: "bg-orange-500", hex: "#f97316", chip: "bg-orange-50 text-orange-700" },
};

export const STATUS_CHIP = {
  Sanctioned: "bg-slate-100 text-slate-700",
  "In Progress": "bg-blue-100 text-blue-700",
  Completed: "bg-emerald-100 text-emerald-700",
  Stalled: "bg-rose-100 text-rose-700",
};