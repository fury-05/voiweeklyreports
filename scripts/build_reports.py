import os
import json
import hashlib
from datetime import datetime

BASE_REPORTS_DIR = "reports"
OUTPUT_DIR = "data"
OUTPUT_FILE = os.path.join(OUTPUT_DIR, "reports.json")

REQUIRED_FILES = {
    "network.md",
    "grants.md",
    "transparency.md",
}

TEMPLATE_KEYWORDS = ["template", "_template", ".template."]


def is_template(filename: str) -> bool:
    fname = filename.lower()
    return any(k in fname for k in TEMPLATE_KEYWORDS)


def is_real_md(filename: str) -> bool:
    return filename.endswith(".md") and not is_template(filename)


def read_file(path: str) -> str:
    with open(path, "r", encoding="utf-8") as f:
        return f.read().strip()


def file_hash(content: str) -> str:
    return hashlib.sha256(content.encode("utf-8")).hexdigest()


def load_existing_data():
    if not os.path.exists(OUTPUT_FILE):
        return []
    with open(OUTPUT_FILE, "r", encoding="utf-8") as f:
        return json.load(f)


def save_data(data):
    os.makedirs(OUTPUT_DIR, exist_ok=True)
    with open(OUTPUT_FILE, "w", encoding="utf-8") as f:
        json.dump(data, f, indent=2, ensure_ascii=False)


def build():
    existing_data = load_existing_data()
    index = {item["source_path"]: item for item in existing_data}

    new_entries = 0
    updated_entries = 0

    for year in sorted(os.listdir(BASE_REPORTS_DIR)):
        year_path = os.path.join(BASE_REPORTS_DIR, year)
        if not os.path.isdir(year_path):
            continue

        for month in sorted(os.listdir(year_path)):
            month_path = os.path.join(year_path, month)
            if not os.path.isdir(month_path):
                continue

            for period in sorted(os.listdir(month_path)):
                period_path = os.path.join(month_path, period)
                if not os.path.isdir(period_path):
                    continue

                files = os.listdir(period_path)
                real_files = {
                    f for f in files if is_real_md(f)
                }

                # Only process complete report sets
                if real_files != REQUIRED_FILES:
                    continue

                for filename in sorted(real_files):
                    file_path = os.path.join(period_path, filename)
                    content = read_file(file_path)
                    content_hash = file_hash(content)

                    source_path = file_path.replace("\\", "/")

                    entry = {
                        "year": int(year),
                        "month": month,
                        "period": period,
                        "category": filename.replace(".md", ""),
                        "content": content,
                        "source_path": source_path,
                        "content_hash": content_hash,
                        "last_processed": datetime.utcnow().isoformat() + "Z",
                    }

                    if source_path in index:
                        if index[source_path]["content_hash"] != content_hash:
                            index[source_path].update(entry)
                            updated_entries += 1
                    else:
                        index[source_path] = entry
                        new_entries += 1

    final_data = list(index.values())
    final_data.sort(
        key=lambda x: (x["year"], x["month"], x["period"], x["category"])
    )

    save_data(final_data)

    print(
        f"Build complete | New: {new_entries} | Updated: {updated_entries} | Total: {len(final_data)}"
    )


if __name__ == "__main__":
    build()
