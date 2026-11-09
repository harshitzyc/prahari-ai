"""
PRAHARI API — AI-Powered MPLADS Anomaly, Fraud & Inefficiency Detection
SIH 2026 | PS 26102 | Team HexaCore
"""

from collections import defaultdict
from datetime import date, datetime

from fastapi import FastAPI, HTTPException, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

from anomaly_engine import compute_risk, risk_level, SIGNAL_LABELS
from mock_data import generate_projects
from upload_processor import process_csv

# ──────────────────────────── App Setup ────────────────────────────

app = FastAPI(
    title="PRAHARI API",
    version="0.2.0",
    description="SIH 2026 | PS 26102 | Team HexaCore | AI overlay for MPLADS oversight",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# ──────────────────────────── Data Init ────────────────────────────

TODAY = date.today()
PROJECTS = generate_projects()
PROJECT_INDEX = {p["id"]: p for p in PROJECTS}

# Build indices for the anomaly engine
hash_index = defaultdict(set)
vendor_counts = defaultdict(int)
for p in PROJECTS:
    hash_index[p["photo_hash"]].add(p["id"])
    vendor_counts[(p["vendor"], p["district"])] += 1

# Compute risk scores for all mock projects
for p in PROJECTS:
    score, factors, headline = compute_risk(p, hash_index, vendor_counts, TODAY)
    p["risk_score"] = score
    p["risk_level"] = risk_level(score)
    p["factors"] = factors
    p["headline"] = headline

# In-memory officer verification store (resets on restart)
VERIFICATION = {}


# ──────────────────────────── Models ───────────────────────────────

class VerificationAction(BaseModel):
    action: str   # "confirm" | "dismiss"
    remark: str = ""


# ──────────────────────────── Helpers ──────────────────────────────

def with_state(p):
    """Attach verification state to a project dict."""
    return {**p, "verification": VERIFICATION.get(p["id"], {"status": "pending"})}


# ──────────────────────────── Core Endpoints ───────────────────────

@app.get("/api/health")
def health():
    return {"status": "ok", "platform": "PRAHARI", "version": "0.2.0", "date": TODAY.isoformat()}


@app.get("/api/stats")
def stats():
    sanctioned = sum(p["sanctioned_amount"] for p in PROJECTS)
    released = sum(p["released_amount"] for p in PROJECTS)
    utilized = sum(p["utilized_amount"] for p in PROJECTS)
    flagged = [p for p in PROJECTS if p["risk_score"] >= 34]
    return {
        "total_works": len(PROJECTS),
        "districts": len({p["district"] for p in PROJECTS}),
        "constituencies": len({p["constituency"] for p in PROJECTS}),
        "sanctioned_cr": round(sanctioned / 100, 2),
        "released_cr": round(released / 100, 2),
        "utilized_cr": round(utilized / 100, 2),
        "unspent_cr": round((released - utilized) / 100, 2),
        "utilization_pct": round(100 * utilized / released, 1) if released else 0,
        "high_risk": sum(1 for p in PROJECTS if p["risk_score"] >= 67),
        "flagged": len(flagged),
        "pending_verification": sum(1 for p in flagged if p["id"] not in VERIFICATION),
        "national_unspent_target_cr": 1700,
        "entitlement": "Rs 5 Cr / MP / year",
    }


@app.get("/api/filters")
def filters():
    return {
        "districts": sorted({p["district"] for p in PROJECTS}),
        "statuses": ["Sanctioned", "In Progress", "Completed", "Stalled"],
        "risk_levels": ["High", "Medium", "Low"],
    }


@app.get("/api/projects")
def list_projects(search: str = "", district: str = "", status: str = "", risk: str = ""):
    out = []
    for p in PROJECTS:
        if district and p["district"] != district:
            continue
        if status and p["status"] != status:
            continue
        if risk and p["risk_level"] != risk:
            continue
        hay = (p["name"] + p["work_code"] + p["constituency"] + p["vendor"]).lower()
        if search and search.lower() not in hay:
            continue
        out.append(with_state(p))
    out.sort(key=lambda x: (-x["risk_score"], x["id"]))
    return out


@app.get("/api/projects/{project_id}")
def get_project(project_id: str):
    if project_id not in PROJECT_INDEX:
        raise HTTPException(404, "Project not found")
    return with_state(PROJECT_INDEX[project_id])


@app.get("/api/top-risky")
def top_risky(limit: int = 8):
    ranked = sorted(PROJECTS, key=lambda x: -x["risk_score"])
    return [with_state(p) for p in ranked[:limit] if p["risk_score"] >= 34]


# ──────────────────────────── Analytics ────────────────────────────

@app.get("/api/analytics/distribution")
def distribution():
    return [
        {"level": lvl, "count": sum(1 for p in PROJECTS if p["risk_level"] == lvl)}
        for lvl in ("Low", "Medium", "High")
    ]


@app.get("/api/analytics/evidence-mix")
def evidence_mix():
    totals = defaultdict(float)
    for p in PROJECTS:
        if p["risk_score"] >= 34:
            for f in p["factors"]:
                totals[f["signal"]] += f["contribution"]
    return [
        {"signal": s, "label": SIGNAL_LABELS[s], "value": round(v, 1)}
        for s, v in sorted(totals.items(), key=lambda kv: -kv[1])
    ]


@app.get("/api/analytics/stage-risk")
def stage_risk():
    def avg(items):
        return round(sum(x["risk_score"] for x in items) / len(items), 1) if items else 0
    return [
        {"stage": "Sanction", "risk": avg([p for p in PROJECTS if p["status"] == "Sanctioned"])},
        {"stage": "Execution", "risk": avg([p for p in PROJECTS if p["status"] in ("In Progress", "Stalled")])},
        {"stage": "Completion", "risk": avg([p for p in PROJECTS if p["status"] == "Completed"])},
        {"stage": "Audit", "risk": avg([p for p in PROJECTS if p["audit_objection"]])},
    ]


# ──────────────────────────── MP Dashboard ─────────────────────────

@app.get("/api/mp-dashboard")
def mp_dashboard():
    """Per-MP constituency summary for the MP / Constituency view."""
    by_mp = {}
    for p in PROJECTS:
        mp = p["mp"]
        if mp not in by_mp:
            by_mp[mp] = {
                "mp": mp,
                "constituency": p["constituency"],
                "district": p["district"],
                "works": [],
            }
        by_mp[mp]["works"].append(p)

    rows = []
    for mp, data in by_mp.items():
        works = data["works"]
        sanctioned = sum(w["sanctioned_amount"] for w in works)
        released = sum(w["released_amount"] for w in works)
        utilized = sum(w["utilized_amount"] for w in works)
        high_risk = sum(1 for w in works if w["risk_score"] >= 67)
        avg_risk = round(sum(w["risk_score"] for w in works) / len(works), 1) if works else 0
        util_pct = round(100 * utilized / released, 1) if released else 0

        rows.append({
            "mp": mp,
            "constituency": data["constituency"],
            "district": data["district"],
            "total_works": len(works),
            "sanctioned_cr": round(sanctioned / 100, 2),
            "released_cr": round(released / 100, 2),
            "utilized_cr": round(utilized / 100, 2),
            "utilization_pct": util_pct,
            "high_risk": high_risk,
            "avg_risk": avg_risk,
        })

    rows.sort(key=lambda x: -x["high_risk"])
    return rows


# ──────────────────────────── CSV Upload ───────────────────────────

@app.post("/api/upload")
async def upload_csv(file: UploadFile = File(...)):
    """Upload a CSV of MPLADS works and get AI risk scores in real-time."""
    if not file.filename or not file.filename.lower().endswith(".csv"):
        raise HTTPException(400, "Only CSV files are accepted")

    content = await file.read()
    try:
        text = content.decode("utf-8")
    except UnicodeDecodeError:
        raise HTTPException(400, "File must be UTF-8 encoded CSV")

    try:
        result = process_csv(text)
    except Exception as e:
        raise HTTPException(400, f"Failed to process CSV: {str(e)}")

    if result["summary"]["total_works"] == 0:
        raise HTTPException(400, "No valid projects found in CSV. Check column headers.")

    for p in result["projects"]:
        if p["id"] not in PROJECT_INDEX:  # Only add if it doesn't already exist!
            PROJECTS.append(p)
            PROJECT_INDEX[p["id"]] = p

    return result


# ──────────────────────────── Verification ─────────────────────────

@app.get("/api/verification/queue")
def queue():
    flagged = [with_state(p) for p in PROJECTS if p["risk_score"] >= 34]
    flagged.sort(key=lambda x: -x["risk_score"])
    return flagged


@app.post("/api/verification/{project_id}")
def submit_verification(project_id: str, body: VerificationAction):
    if project_id not in PROJECT_INDEX:
        raise HTTPException(404, "Project not found")
    if body.action not in ("confirm", "dismiss"):
        raise HTTPException(400, "action must be 'confirm' or 'dismiss'")
    VERIFICATION[project_id] = {
        "status": "confirmed" if body.action == "confirm" else "dismissed",
        "remark": body.remark,
        "officer": "Sri V. Nagaraj, Nodal Officer (mock login)",
        "at": datetime.now().isoformat(timespec="seconds"),
    }
    return {
        "ok": True,
        "project_id": project_id,
        "verification": VERIFICATION[project_id],
        "note": "Feedback logged → continuous-learning retraining queue.",
    }


# ──────────────────────────── Run ──────────────────────────────────

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)