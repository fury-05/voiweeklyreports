/**
 * Build JSON files for website from Markdown reports
 * Run: node scripts/build-json.js
 */

const fs = require("fs");
const path = require("path");
const matter = require("gray-matter");

const REPORTS_DIR = path.join(__dirname, "..", "reports");
const DATA_DIR = path.join(__dirname, "..", "data");

if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR);
}

// ---------- helpers ----------
function walk(dir, files = []) {
  for (const f of fs.readdirSync(dir)) {
    const p = path.join(dir, f);
    fs.statSync(p).isDirectory() ? walk(p, files) : files.push(p);
  }
  return files;
}

function extractTable(markdown) {
  const lines = markdown.split("\n");
  const rows = lines.filter(l => l.startsWith("|"));
  const data = {};
  rows.slice(2).forEach(row => {
    const cols = row.split("|").map(c => c.trim()).filter(Boolean);
    if (cols.length === 2) data[cols[0]] = cols[1];
  });
  return data;
}

// ---------- collectors ----------
const network = [];
const grants = [];
const transparency = [];

walk(REPORTS_DIR).forEach(file => {
  if (!file.endsWith(".md")) return;

  const raw = fs.readFileSync(file, "utf8");
  const { data, content } = matter(raw);

  // NETWORK
  if (file.endsWith("network.md")) {
    network.push({
      week: data.week_id,
      metrics: extractTable(content)
    });
  }

  // GRANTS
  if (file.endsWith("grants.md")) {
    const rows = content.split("\n").filter(l => l.startsWith("|")).slice(2);
    const items = rows.map(r => {
      const c = r.split("|").map(x => x.trim()).filter(Boolean);
      return {
        proposal: c[0],
        submitter: c[1],
        status: c[4],
        assigned: c[3]
      };
    });

    grants.push({
      period: data.period,
      items
    });
  }

  // TRANSPARENCY
  if (file.endsWith("transparency.md")) {
    transparency.push({
      period: data.period,
      data: extractTable(content)
    });
  }
});

// ---------- write output ----------
fs.writeFileSync(
  path.join(DATA_DIR, "network.json"),
  JSON.stringify(network, null, 2)
);

fs.writeFileSync(
  path.join(DATA_DIR, "grants.json"),
  JSON.stringify(grants, null, 2)
);

fs.writeFileSync(
  path.join(DATA_DIR, "transparency.json"),
  JSON.stringify(transparency, null, 2)
);

console.log("✅ JSON files generated in /data");
