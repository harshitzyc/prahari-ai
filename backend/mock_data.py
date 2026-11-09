"""
Seeded, realistic MPLADS mock data for 3 pilot (nodal) districts.
Anomalies are injected deliberately so the engine can detect them
from raw fields - no hard-coded risk scores.
"""
import random
from datetime import date, timedelta

RNG = random.Random(26102)  # PS ID as seed -> reproducible demo

CATEGORIES = {
    "Roads & Pathways":        {"unit": "km",       "dsr": 18.0},
    "Drinking Water":          {"unit": "scheme",   "dsr": 22.0},
    "Education Infrastructure":{"unit": "building", "dsr": 28.0},
    "Health Infrastructure":   {"unit": "building", "dsr": 32.0},
    "Sanitation & Drainage":   {"unit": "km",       "dsr": 12.0},
    "Community Halls":         {"unit": "building", "dsr": 18.0},
    "Irrigation Works":        {"unit": "scheme",   "dsr": 35.0},
    "Electrification":         {"unit": "km",       "dsr": 15.0},
}

DISTRICTS = [
    {"name": "Mysuru", "constituencies": [
        {"name": "Mysuru", "center": (12.30, 76.65)},
        {"name": "Chamarajanagar", "center": (11.92, 76.94)}]},
    {"name": "Mandya", "constituencies": [
        {"name": "Mandya", "center": (12.52, 76.90)},
        {"name": "Maddur", "center": (12.58, 77.04)}]},
    {"name": "Bengaluru Rural", "constituencies": [
        {"name": "Bengaluru Rural", "center": (13.08, 77.60)},
        {"name": "Chikkballapur", "center": (13.43, 77.73)}]},
]

MP_MAP = {
    "Mysuru": "Sri A. Devaraj", "Chamarajanagar": "Smt. K. Manasa",
    "Mandya": "Sri R. Chandrashekar", "Maddur": "Smt. P. Lakshmi",
    "Bengaluru Rural": "Sri V. Nagaraj", "Chikkballapur": "Smt. S. Bhagya",
}

VILLAGES = ["Hirehalli", "Devanur", "Kaglipur", "Belakere", "Somanahalli",
            "Arakere", "Hosahalli", "Neriga", "Bettahalli", "Kodihalli",
            "Maragondahalli", "Thippagondanahalli"]

NAME_TEMPLATES = {
    "Roads & Pathways": ["CC Road from {a} to {b}", "BT Road widening in {a}", "Approach road to {a} lake bund"],
    "Drinking Water": ["Overhead tank & pipeline at {a}", "Drinking water scheme, Ward {n}, {a}"],
    "Education Infrastructure": ["Additional classrooms, GHPS {a}", "Anganwadi building at {a}"],
    "Health Infrastructure": ["Sub-centre building at {a}", "PHC upgradation, {a}"],
    "Sanitation & Drainage": ["Underground drainage, {a}", "Solid waste management shed, {a}"],
    "Community Halls": ["Community hall at {a}", "Grama Vasthya Bhavan, {a}"],
    "Irrigation Works": ["Minor tank desilting - {a} tank", "Canal lining works near {a}"],
    "Electrification": ["Street lighting, {a} gram panchayat", "Feeder line extension to {a}"],
}

VENDORS = ["M/s Kaveri Constructions", "M/s Nandi Infra", "M/s Sri Venkateshwara Builders",
           "M/s Shree Ganesh Constructions", "M/s Malnad Engineers", "M/s Cauvery Projects",
           "M/s Devaraja Infra", "M/s Chamundi Works", "M/s Tungabhadra Constructions",
           "M/s Sahyadri Builders", "M/s Halli Infra Services", "M/s Ghataprabha Constructions"]
COLLUDING_VENDOR = VENDORS[3]


def generate_projects(n=48):
    today = date.today()
    projects = []
    for i in range(n):
        district = RNG.choice(DISTRICTS)
        const = RNG.choice(district["constituencies"])
        category = RNG.choice(list(CATEGORIES))
        meta = CATEGORIES[category]
        dsr = meta["dsr"]
        cost = round(dsr * RNG.uniform(0.85, 1.12), 2)
        qty = RNG.randint(1, 4)
        sanctioned = round(cost * qty, 1)

        sanction_date = today - timedelta(days=RNG.randint(150, 950))
        start_date = sanction_date + timedelta(days=RNG.randint(15, 60))
        status = RNG.choices(["In Progress", "Completed", "Sanctioned", "Stalled"],
                             weights=[45, 35, 12, 8])[0]
        planned_completion = start_date + timedelta(days=RNG.randint(180, 420))

        if status == "Sanctioned":
            released = round(sanctioned * RNG.uniform(0.25, 0.5), 1); utilized = 0.0
        elif status == "Completed":
            released = sanctioned; utilized = round(sanctioned * RNG.uniform(0.93, 1.0), 1)
        elif status == "Stalled":
            released = round(sanctioned * RNG.uniform(0.5, 0.85), 1)
            utilized = round(released * RNG.uniform(0.15, 0.4), 1)
        else:
            released = round(sanctioned * RNG.uniform(0.6, 0.95), 1)
            utilized = round(released * RNG.uniform(0.3, 0.8), 1)

        actual_completion = (planned_completion - timedelta(days=RNG.randint(-20, 40))
                             if status == "Completed" else None)

        a, b = RNG.sample(VILLAGES, 2)
        name = RNG.choice(NAME_TEMPLATES[category]).format(a=a, b=b, n=RNG.randint(1, 12))

        projects.append({
            "id": f"PRJ-{1000 + i}",
            "work_code": f"MPLADS-KA-{sanction_date.year}-{1000 + i}",
            "name": name, "category": category, "unit": meta["unit"],
            "quantity": qty, "cost_per_unit": cost, "dsr_benchmark": dsr,
            "district": district["name"], "constituency": const["name"],
            "mp": MP_MAP[const["name"]], "vendor": RNG.choice(VENDORS),
            "sanctioned_amount": sanctioned, "released_amount": released,
            "utilized_amount": utilized,
            "sanction_date": sanction_date, "start_date": start_date,
            "planned_completion": planned_completion, "actual_completion": actual_completion,
            "uc_due": sanction_date + timedelta(days=365), "status": status,
            "latitude": round(const["center"][0] + RNG.uniform(-0.09, 0.09), 4),
            "longitude": round(const["center"][1] + RNG.uniform(-0.09, 0.09), 4),
            "photo_hash": f"phash_{RNG.getrandbits(48):012x}",
            "photo_distance_km": round(RNG.uniform(0.05, 1.4), 2),
            "certificate_backdated": False,
            "audit_objection": RNG.random() < 0.15,
        })

    _inject_anomalies(projects, today)
    return projects


def _inject_anomalies(projects, today):
    # 1) Inflated costs vs DSR
    for i in (2, 12, 15, 24, 33, 44):
        p = projects[i]
        p["cost_per_unit"] = round(p["dsr_benchmark"] * RNG.uniform(1.38, 1.72), 2)
        p["sanctioned_amount"] = round(p["cost_per_unit"] * p["quantity"], 1)
        if p["status"] != "Sanctioned":
            p["released_amount"] = round(p["sanctioned_amount"] * RNG.uniform(0.7, 1.0), 1)
            p["utilized_amount"] = min(p["utilized_amount"], p["released_amount"])

    # 2) Geo-tag mismatches (photo GPS far from site)
    for i in (6, 17, 29, 41):
        projects[i]["photo_distance_km"] = round(RNG.uniform(9, 38), 1)

    # 3) Duplicate completion photos (same perceptual hash)
    for a, b in ((4, 17), (22, 31), (9, 38)):
        h = f"phash_{RNG.getrandbits(48):012x}"
        projects[a]["photo_hash"] = h
        projects[b]["photo_hash"] = h

    # 4) Severe delays + low utilisation
    for i in (8, 17, 19, 27, 36):
        p = projects[i]
        p["status"] = "In Progress"
        p["planned_completion"] = today - timedelta(days=RNG.randint(100, 320))
        p["released_amount"] = round(p["sanctioned_amount"] * RNG.uniform(0.6, 0.9), 1)
        p["utilized_amount"] = round(p["released_amount"] * RNG.uniform(0.15, 0.35), 1)
        p["actual_completion"] = None

    # 5) Backdated completion certificates
    for i in (15, 40):
        p = projects[i]
        p["status"] = "Completed"
        p["certificate_backdated"] = True
        p["actual_completion"] = p["sanction_date"] - timedelta(days=RNG.randint(10, 45))
        p["released_amount"] = p["sanctioned_amount"]
        p["utilized_amount"] = p["sanctioned_amount"]

    # 6) Vendor collusion: one vendor dominates Mandya district
    for p in [x for x in projects if x["district"] == "Mandya"][:8]:
        p["vendor"] = COLLUDING_VENDOR