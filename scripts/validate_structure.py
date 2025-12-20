import os
import sys

BASE_REPORTS_DIR = "reports"

REQUIRED_FILES = {
    "network.md",
    "grants.md",
    "transparency.md",
}

ALLOWED_PERIODS = {
    "01-10",
    "11-20",
    "21-31",
    "21-30",
    "21-29",
    "21-28",
}

TEMPLATE_KEYWORDS = ["template", "_template", ".template."]


def is_template(filename: str) -> bool:
    fname = filename.lower()
    return any(k in fname for k in TEMPLATE_KEYWORDS)


def is_real_md(filename: str) -> bool:
    return filename.endswith(".md") and not is_template(filename)


def validate():
    errors = []

    if not os.path.isdir(BASE_REPORTS_DIR):
        print("No reports directory found — skipping validation.")
        return

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

                # Validate period folder name
                if period not in ALLOWED_PERIODS:
                    errors.append(
                        f"Invalid period folder: {period_path}"
                    )
                    continue

                files = os.listdir(period_path)
                real_md_files = {
                    f for f in files if is_real_md(f)
                }

                # Case 1: empty or templates only → allowed
                if not real_md_files:
                    continue

                # Case 2: partial real files → FAIL
                missing = REQUIRED_FILES - real_md_files
                extra = real_md_files - REQUIRED_FILES

                if missing or extra:
                    errors.append(
                        f"Incomplete report in {period_path} | "
                        f"Missing: {sorted(missing)} | "
                        f"Unexpected: {sorted(extra)}"
                    )

    if errors:
        print("\nVALIDATION FAILED:\n")
        for e in errors:
            print(f"- {e}")
        sys.exit(1)

    print("Validation passed (structure is valid).")


if __name__ == "__main__":
    validate()
