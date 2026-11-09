"""
PRAHARI - Explainable risk engine (FINAL DEMO TUNING).
Aggressive scoring for severe fraud patterns (ghost works, backdated docs)
while maintaining precision for clean projects.
"""

WEIGHTS = {
    "financial": 0.25,   # DSR cost benchmarking
    "visual":    0.25,   # duplicate photos / image forensics
    "geo":       0.25,   # Increased: geo is critical for MPLADS ghost works
    "temporal":  0.15,   # delays + UC fund ageing
    "network":   0.05,   # vendor collusion
    "textual":   0.05,   # document NLP (base weight, boosted by interaction)
}

SIGNAL_LABELS = {
    "financial": "Financial / DSR Benchmarking",
    "visual":    "Visual / Image Forensics",
    "geo":       "Geo-spatial Validation",
    "temporal":  "Timeline & Fund Utilisation",
    "network":   "Vendor Network Analysis",
    "textual":   "Document / NLP Analysis",
}

SHORT = {
    "financial": "Inflated costs",
    "visual":    "Duplicate photos",
    "geo":       "Geo mismatch",
    "temporal":  "Delays & fund ageing",
    "network":   "Vendor collusion",
    "textual":   "Document inconsistency",
}


def risk_level(score: int) -> str:
    return "High" if score >= 67 else "Medium" if score >= 34 else "Low"


def _c(x: float) -> float:
    return max(0.0, min(1.0, x))


def compute_risk(p, hash_index, vendor_counts, today):
    factors = []

    def add(signal, severity, detail, evidence=None):
        severity = round(_c(severity), 2)
        if severity <= 0.05:
            return
        factors.append({
            "signal": signal,
            "label": SIGNAL_LABELS[signal],
            "severity": severity,
            "contribution": round(WEIGHTS[signal] * severity * 100, 1),
            "detail": detail,
            "evidence": evidence or [],
        })

    # ---- 1. Financial: unit cost vs DSR benchmark (5% tolerance) ----
    dev = (p["cost_per_unit"] - p["dsr_benchmark"]) / p["dsr_benchmark"]
    if dev > 0.05:
        sev = _c((dev - 0.05) / 0.45)
        add("financial", sev,
            f"Unit cost Rs {p['cost_per_unit']:.1f} L/{p['unit']} is {dev*100:.0f}% above "
            f"DSR benchmark Rs {p['dsr_benchmark']:.1f} L/{p['unit']} - possible inflated estimate.",
            ["DSR 2025-26 benchmark", f"Deviation: +{dev*100:.0f}%", "Tolerance: +5%"])

    # ---- 2. Visual: duplicate perceptual image hash ----
    dupes = hash_index.get(p["photo_hash"], set()) - {p["id"]}
    if dupes:
        add("visual", 1.0,
            f"Completion photo hash matches {len(dupes)} other work(s) "
            f"({', '.join(sorted(dupes))}) - same photo reused; possible duplicate/ghost asset.",
            [f"pHash: {p['photo_hash'][:18]}...", "Perceptual hash match"])

    # ---- 3. Geo: photo GPS vs recorded work site (geo-fence 5 km) ----
    d = p.get("photo_distance_km", 0.0)
    if d > 5:
        # Scale: 5km=0, 30km+=1.0
        sev = _c((d - 5) / 25)
        add("geo", sev,
            f"Geo-tag captured {d:.1f} km from the recorded work site in "
            f"{p['constituency']} constituency - outside the 5 km geo-fence.",
            ["Geo-fence radius: 5 km", f"Observed offset: {d:.1f} km"])

    # ---- 4. Temporal: delay past planned completion + UC fund ageing ----
    tdetails, tsev = [], 0.0
    
    if p["status"] in ("In Progress", "Stalled") and p["planned_completion"] and p["planned_completion"] < today:
        delay = (today - p["planned_completion"]).days
        tsev += 0.7 * _c(delay / 365)
        tdetails.append(f"Work is {delay} days past planned completion and still '{p['status']}'.")
    
    if p["status"] == "Stalled":
        tsev += 0.3
        tdetails.append("Project status is 'Stalled' - indicates severe implementation failure.")
        
    if p["released_amount"] > 0 and p["utilized_amount"] < 0.6 * p["released_amount"]:
        util_pct = 100 * p["utilized_amount"] / p["released_amount"]
        if p["uc_due"] and p["uc_due"] < today:
            overdue = (today - p["uc_due"]).days
            tsev += 0.3 * _c(overdue / 180)
            tdetails.append(f"Only {util_pct:.0f}% of released funds utilised; UC overdue by {overdue} days.")
        elif p["status"] in ("In Progress", "Stalled"):
            if util_pct < 30:
                tsev += 0.2
                tdetails.append(f"Critical under-utilisation: only {util_pct:.0f}% of released funds used.")

    if tdetails:
        add("temporal", tsev, " ".join(tdetails),
            ["UC deadline rule", "MPLADS fund-ageing guideline"])

    # ---- 5. Network: vendor concentration in the district ----
    count = vendor_counts.get((p["vendor"], p["district"]), 0)
    if count >= 5:
        add("network", (count - 4) / 4,
            f"Vendor '{p['vendor']}' holds {count} works in {p['district']} district - "
            f"unusually high concentration; possible collusion/rotate-bidding.",
            ["Vendor-work bipartite graph", f"District share: {count} works"])

    # ---- 6. Textual: certificate date consistency (NLP mock) ----
    if p.get("certificate_backdated"):
        add("textual", 0.95,
            f"Completion certificate is dated {p['actual_completion']} - BEFORE the sanction date "
            f"{p['sanction_date']}. Backdated/copy-pasted certificate suspected.",
            ["Date-consistency rule R-14", "OCR + IndicBERT doc check (mock)"])

    # ---- Fusion: weighted sum + INTERACTION BOOSTS for fraud patterns ----
    base = sum(WEIGHTS[f["signal"]] * f["severity"] for f in factors) * 100
    signals = {f["signal"] for f in factors}
    boost = 0
    
    # GHOST WORK PATTERN: Severe geo mismatch (>20km) + Delay/Stalled
    if "geo" in signals and p["status"] in ("In Progress", "Stalled"):
        d = p.get("photo_distance_km", 0)
        if d > 20:
            boost += 30  # Massive boost for ghost work pattern
        elif d > 10:
            boost += 15
            
    # DOCUMENT FRAUD PATTERN: Backdated certificate is a direct fraud indicator
    if p.get("certificate_backdated"):
        boost += 45  # Direct fraud penalty
        
    # INFLATED COST + DELAY = Classic fraud pattern  
    if "financial" in signals and "temporal" in signals:
        boost += 10

    score = int(min(100, round(base + boost)))
    factors.sort(key=lambda f: -f["contribution"])
    headline = " | ".join(SHORT[f["signal"]] for f in factors[:3]) if factors else "No significant anomalies"
    return score, factors, headline