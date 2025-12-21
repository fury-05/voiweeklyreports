let REPORTS = [];

async function loadReports() {
  const res = await fetch("data/reports.json");
  REPORTS = await res.json();
  return REPORTS;
}
