let CURRENT_TAB = "network";

const dashboard = document.getElementById("dashboard");
const yearSel = document.getElementById("year");
const monthSel = document.getElementById("month");
const periodSel = document.getElementById("period");

/* ---------------- NAV ---------------- */
document.querySelectorAll(".menu button").forEach(b => {
  b.onclick = () => {
    document.querySelectorAll(".menu button").forEach(x => x.classList.remove("active"));
    b.classList.add("active");
    CURRENT_TAB = b.dataset.tab;
    render();
  };
});

/* ---------------- LOAD ---------------- */
loadReports().then(initFilters);

function initFilters() {
  const years = [...new Set(REPORTS.map(r => r.year))];
  yearSel.innerHTML = years.map(y => `<option>${y}</option>`).join("");
  yearSel.onchange = updateMonths;
  updateMonths();
}

function updateMonths() {
  const months = [...new Set(
    REPORTS.filter(r => r.year === yearSel.value).map(r => r.month)
  )];
  monthSel.innerHTML = months.map(m => `<option>${m}</option>`).join("");
  monthSel.onchange = updatePeriods;
  updatePeriods();
}

function updatePeriods() {
  const periods = [...new Set(
    REPORTS.filter(r =>
      r.year === yearSel.value &&
      r.month === monthSel.value
    ).map(r => r.period)
  )];
  periodSel.innerHTML = periods.map(p => `<option>${p}</option>`).join("");
  render();
}

/* ---------------- MAIN ---------------- */
function render() {
  const item = REPORTS.find(r =>
    r.year === yearSel.value &&
    r.month === monthSel.value &&
    r.period === periodSel.value &&
    r.category === CURRENT_TAB
  );

  if (!item) {
    dashboard.innerHTML = "No report for selected period.";
    return;
  }

  if (CURRENT_TAB === "network") renderNetwork(item.data);
  if (CURRENT_TAB === "grants") renderGrants(item.data);
  if (CURRENT_TAB === "transparency") renderTransparency(item.data);
}

/* ---------------- HELPERS ---------------- */
const card = (l,v)=>`
<div class="card">
  <div class="label">${l}</div>
  <div class="value">${v ?? "—"}</div>
</div>`;

const section = (t,c)=>`
<div class="section">
  <h2>${t}</h2>${c}
</div>`;

const tableOrEmpty = (rows, empty="No entries") =>
  rows.length ? rows : `<tr><td colspan="5">${empty}</td></tr>`;

/* ================= GRANTS ================= */
function renderGrants(d) {
  const rows = (d.grants_submitted_in_progress || []).map(p => `
    <tr>
      <td>${p.proposal_name}</td>
      <td>${p.submitted_by}</td>
      <td>${p.date_submitted}</td>
      <td>${p.assigned_to}</td>
      <td>${p.proposal_status}</td>
    </tr>
  `);

  dashboard.innerHTML = `
${section("Monthly Snapshot",`
<div class="grid">
${card("Total Proposals", d.monthly_snapshot?.total_proposals_tracked)}
${card("New Submissions", d.monthly_snapshot?.new_submissions)}
${card("Under Review", d.monthly_snapshot?.under_review)}
${card("Approved", d.monthly_snapshot?.approved)}
${card("Funded", d.monthly_snapshot?.funded)}
</div>` )}

${section("Grants Submitted & In Progress",`
<table>
<tr><th>Proposal</th><th>Submitted By</th><th>Date</th><th>Assigned To</th><th>Status</th></tr>
${tableOrEmpty(rows)}
</table>` )}

${section("Highlights & Notes", `<p>${d.highlights_notes || "—"}</p>`)}
`;
}

/* ================= TRANSPARENCY ================= */
function renderTransparency(d) {
  const payments = (d.community_ecosystem_payments || []).map(p => `
    <tr>
      <td>${p.date}</td>
      <td>${p.recipient}</td>
      <td>${p.amount_voi}</td>
      <td>${p.purpose}</td>
      <td>${p.source_wallet}</td>
    </tr>
  `);

  dashboard.innerHTML = `
${section("Token Supply Summary",`
<div class="grid">
${card("Total Supply (VOI)", d.token_supply_summary?.total_supply_voi)}
${card("Circulating Supply", d.token_supply_summary?.circulating_supply_voi)}
${card("Unlocked Tokens", d.token_supply_summary?.unlocked_tokens_voi)}
${card("Locked Tokens", d.token_supply_summary?.locked_tokens_voi)}
</div>` )}

${section("Token Distribution Breakdown",`
<div class="grid">
${card("Community Allocation", d.token_distribution_breakdown?.community_allocation_voi)}
${card("Market Liquidity", d.token_distribution_breakdown?.market_liquidity_voi)}
${card("Ecosystem Incentives", d.token_distribution_breakdown?.ecosystem_incentives_voi)}
${card("Block Authority", d.token_distribution_breakdown?.block_authority_allocation_voi)}
${card("Other / Reserves", d.token_distribution_breakdown?.other_reserves_voi)}
</div>` )}

${section("Market Availability",`
<div class="grid">
${card("Tokens on CEX", d.market_availability?.tokens_on_cex_voi)}
${card("Tokens on DEX", d.market_availability?.tokens_on_dex_voi)}
${card("Total Liquidity", d.market_availability?.total_liquidity_voi)}
${card("FDV ($)", d.market_availability?.fdv_usd)}
${card("TDV ($)", d.market_availability?.tdv_usd)}
</div>` )}

${section("Community & Ecosystem Payments",`
<table>
<tr><th>Date</th><th>Recipient</th><th>Amount</th><th>Purpose</th><th>Source</th></tr>
${tableOrEmpty(payments)}
</table>` )}

${section("Limitations & Disclaimers", `<p>${d.limitations_disclaimers || "—"}</p>` )}

${section("Summary",`
<div class="grid">
${card("Supply Transparency", d.summary?.supply_transparency)}
${card("Authority Spend Activity", d.summary?.authority_spend_activity)}
${card("Community Funding Health", d.summary?.community_funding_health)}
${card("Risks or Concerns", d.summary?.risks_or_concerns)}
</div>` )}
`;
}
