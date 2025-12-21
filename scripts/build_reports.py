import os
import json
import re
from datetime import datetime

BASE_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
REPORTS_DIR = os.path.join(BASE_DIR, "reports")
DATA_DIR = os.path.join(BASE_DIR, "data")
OUTPUT_FILE = os.path.join(DATA_DIR, "reports.json")

def read_md(path):
    if not os.path.exists(path):
        return ""
    with open(path, "r", encoding="utf-8") as f:
        return f.read()

def parse_kv(text):
    """
    Parses:
    Key: Value
    """
    data = {}
    for line in text.splitlines():
        if ":" in line:
            k, v = line.split(":", 1)
            data[k.strip().lower().replace(" ", "_")] = v.strip()
    return data

def extract_section(text, title):
    pattern = rf"## {re.escape(title)}(.*?)(?=\n## |\Z)"
    m = re.search(pattern, text, re.S)
    return m.group(1).strip() if m else ""

def build_network(md):
    return {
        "market_snapshot": parse_kv(extract_section(md, "Market Snapshot")),
        "network_nodes": parse_kv(extract_section(md, "Network Nodes")),
        "relay_health_changes": parse_kv(extract_section(md, "Relay Health & Changes")),
        "transaction_analysis_overview": parse_kv(extract_section(md, "Transaction Analysis — Overview")),
        "profitability_at_a_glance": parse_kv(extract_section(md, "Profitability — At a Glance")),
        "transaction_breakdown": parse_kv(extract_section(md, "Transaction Breakdown")),
        "relay_to_node_ratio": parse_kv(extract_section(md, "Relay to Node Ratio")),
        "weekly_observations": {
            "observations": extract_section(md, "Weekly Observations")
        },
        "data_availability_limitations": {
            "notes": extract_section(md, "Data Availability & Limitations")
        },
        "summary": parse_kv(extract_section(md, "Summary"))
    }

def build_grants(md):
    snapshot = parse_kv(extract_section(md, "Monthly Snapshot"))

    rows = []
    table = extract_section(md, "Grants Submitted & In Progress")
    for line in table.splitlines():
        if "|" in line:
            parts = [p.strip() for p in line.split("|") if p.strip()]
            if len(parts) == 5:
                rows.append({
                    "proposal_name": parts[0],
                    "submitted_by": parts[1],
                    "date_submitted": parts[2],
                    "assigned_to": parts[3],
                    "proposal_status": parts[4]
                })

    return {
        "monthly_snapshot": snapshot,
        "grants_submitted_in_progress": rows,
        "highlights_notes": extract_section(md, "Highlights & Notes")
    }

def build_transparency(md):
    return {
        "token_supply_summary": parse_kv(extract_section(md, "Token Supply Summary")),
        "token_distribution_breakdown": parse_kv(extract_section(md, "Token Distribution Breakdown")),
        "market_availability": parse_kv(extract_section(md, "Market Availability")),
        "community_ecosystem_payments": [],
        "limitations_disclaimers": extract_section(md, "Limitations & Disclaimers"),
        "summary": parse_kv(extract_section(md, "Summary"))
    }

def load_existing():
    if not os.path.exists(OUTPUT_FILE):
        return []
    with open(OUTPUT_FILE, "r", encoding="utf-8") as f:
        return json.load(f)

def save(data):
    os.makedirs(DATA_DIR, exist_ok=True)
    with open(OUTPUT_FILE, "w", encoding="utf-8") as f:
        json.dump(data, f, indent=2)

def main():
    existing = load_existing()
    results = []

    if not os.path.exists(REPORTS_DIR):
        save(existing)
        return

    for root, dirs, files in os.walk(REPORTS_DIR):
        if not files:
            continue

        parts = root.replace(REPORTS_DIR, "").strip(os.sep).split(os.sep)
        if len(parts) < 3:
            continue

        year, month, period = parts[0], parts[1], parts[2]

        for category in ["network", "grants", "transparency"]:
            md_path = os.path.join(root, f"{category}.md")
            md = read_md(md_path)
            if not md:
                continue

            if category == "network":
                data = build_network(md)
            elif category == "grants":
                data = build_grants(md)
            else:
                data = build_transparency(md)

            record = {
                "year": year,
                "month": month,
                "period": period,
                "category": category,
                "data": data,
                "generated_at": datetime.utcnow().isoformat() + "Z"
            }

            results.append(record)

    # append-only merge
    final = existing[:]
    for r in results:
        if not any(
            x["year"] == r["year"] and
            x["month"] == r["month"] and
            x["period"] == r["period"] and
            x["category"] == r["category"]
            for x in existing
        ):
            final.append(r)

    save(final)

if __name__ == "__main__":
    main()
