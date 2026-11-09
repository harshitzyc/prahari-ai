"""CSV upload processor with debug output."""
import csv
import io
from datetime import date, datetime
from collections import defaultdict

from anomaly_engine import compute_risk, risk_level


def parse_date(s):
    if not s or str(s).strip() == "":
        return None
    try:
        return datetime.strptime(str(s).strip(), "%Y-%m-%d").date()
    except (ValueError, TypeError):
        return None


def parse_bool(s):
    if not s:
        return False
    return str(s).strip().lower() in ("true", "1", "yes", "y")


def parse_float(s, default=0.0):
    try:
        val = float(str(s).strip())
        return val if val > 0 else default
    except (ValueError, TypeError, AttributeError):
        return default


def process_csv(file_content: str):
    reader = csv.DictReader(io.StringIO(file_content))
    projects = []
    hash_index = defaultdict(set)
    vendor_counts = defaultdict(int)
    today = date.today()
    
    print(f"\n{'='*60}")
    print(f" DEBUG: Processing CSV upload")
    print(f"{'='*60}\n")
    
    for idx, row in enumerate(reader):
        work_code = str(row.get("work_code", f"UPLOAD-{idx}")).strip()
        
        # Parse critical fields
        cost = parse_float(row.get("cost_per_unit"))
        dsr = parse_float(row.get("dsr_benchmark"))
        distance = parse_float(row.get("photo_distance_km"))
        backdated = parse_bool(row.get("certificate_backdated"))
        sanction_date = parse_date(row.get("sanction_date"))
        planned_comp = parse_date(row.get("planned_completion"))
        status = str(row.get("status", "In Progress")).strip()
        vendor = str(row.get("vendor", "Unknown")).strip()
        district = str(row.get("district", "Unknown")).strip()
        
        # Calculate deviation
        deviation = ((cost - dsr) / dsr * 100) if dsr > 0 else 0
        
        print(f" {work_code}:")
        print(f"   Cost: ₹{cost}L | DSR: ₹{dsr}L | Deviation: {deviation:+.1f}%")
        print(f"   Photo Distance: {distance} km")
        print(f"   Backdated Cert: {backdated}")
        print(f"   Status: {status}")
        print(f"   Planned Completion: {planned_comp} | Today: {today}")
        if planned_comp and planned_comp < today:
            days_overdue = (today - planned_comp).days
            print(f"   ⚠️  OVERDUE by {days_overdue} days!")
        print()
        
        p = {
            "id": f"UP-{5000 + idx}",
            "work_code": work_code,
            "name": str(row.get("name", "Unnamed Work")).strip(),
            "category": str(row.get("category", "Other")).strip(),
            "unit": str(row.get("unit", "unit")).strip(),
            "quantity": int(parse_float(row.get("quantity", 1), 1)),
            "cost_per_unit": cost,
            "dsr_benchmark": dsr,
            "district": district,
            "constituency": str(row.get("constituency", "Unknown")).strip(),
            "mp": str(row.get("mp", "Unknown")).strip(),
            "vendor": vendor,
            "sanctioned_amount": parse_float(row.get("sanctioned_amount")),
            "released_amount": parse_float(row.get("released_amount")),
            "utilized_amount": parse_float(row.get("utilized_amount")),
            "sanction_date": sanction_date,
            "start_date": parse_date(row.get("start_date")),
            "planned_completion": planned_comp,
            "actual_completion": parse_date(row.get("actual_completion")),
            "uc_due": parse_date(row.get("uc_due")),
            "status": status,
            "latitude": parse_float(row.get("latitude")),
            "longitude": parse_float(row.get("longitude")),
            "photo_hash": str(row.get("photo_hash", "")).strip(),
            "photo_distance_km": distance,
            "certificate_backdated": backdated,
        }
        
        if not p["sanction_date"] or not p["cost_per_unit"] or not p["dsr_benchmark"]:
            print(f"    SKIPPED: Missing critical fields\n")
            continue
        
        hash_index[p["photo_hash"]].add(p["id"])
        vendor_counts[(p["vendor"], p["district"])] += 1
        projects.append(p)
    
    print(f"✅ Parsed {len(projects)} valid projects\n")
    
    # Compute risk scores with debug
    results = []
    for p in projects:
        score, factors, headline = compute_risk(p, hash_index, vendor_counts, today)
        
        print(f"🎯 {p['work_code']} → Risk Score: {score}/100 ({'HIGH' if score >= 67 else 'MEDIUM' if score >= 34 else 'LOW'})")
        if factors:
            for f in factors[:3]:  # Show top 3 factors
                print(f"   • {f['label']}: +{f['contribution']} pts")
        else:
            print(f"   • No anomalies detected")
        print()
        
        results.append({
            **p,
            "id": p["id"],
            "work_code": p["work_code"],
            "name": p["name"],
            "category": p["category"],
            "district": p["district"],
            "constituency": p["constituency"],
            "vendor": p["vendor"],
            "sanctioned_amount": p["sanctioned_amount"],
            "released_amount": p["released_amount"],
            "utilized_amount": p["utilized_amount"],
            "status": p["status"],
            "risk_score": score,
            "risk_level": risk_level(score),
            "headline": headline,
            "factors": factors,
            "latitude": p["latitude"],
            "longitude": p["longitude"],
        })
    
    results.sort(key=lambda x: -x["risk_score"])
    
    total = len(results)
    high = sum(1 for r in results if r["risk_score"] >= 67)
    medium = sum(1 for r in results if 34 <= r["risk_score"] < 67)
    low = sum(1 for r in results if r["risk_score"] < 34)
    total_sanctioned = sum(r["sanctioned_amount"] for r in results)
    
    print(f"{'='*60}")
    print(f"📊 SUMMARY: {high} High | {medium} Medium | {low} Low")
    print(f"{'='*60}\n")
    
    return {
        "summary": {
            "total_works": total,
            "high_risk": high,
            "medium_risk": medium,
            "low_risk": low,
            "total_sanctioned_lakh": round(total_sanctioned, 2),
            "total_sanctioned_cr": round(total_sanctioned / 100, 2),
        },
        "projects": results,
    }