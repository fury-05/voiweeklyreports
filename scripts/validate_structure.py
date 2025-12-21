import os
import sys

BASE_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
REPORTS_DIR = os.path.join(BASE_DIR, "reports")

REQUIRED_FILES = {
    "network.md",
    "grants.md",
    "transparency.md"
}

def main():
    if not os.path.exists(REPORTS_DIR):
        print("reports/ directory not found — skipping validation")
        return

    for root, dirs, files in os.walk(REPORTS_DIR):
        md_files = {f for f in files if f.endswith(".md")}
        if not md_files:
            continue

        missing = REQUIRED_FILES - md_files
        if missing:
            print(f"Warning: {root} missing files: {', '.join(missing)}")

    print("Structure validation complete")

if __name__ == "__main__":
    main()
