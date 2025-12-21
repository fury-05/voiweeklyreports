/* =========================================================
   GLOBAL STATE
========================================================= */
let REPORTS = [];
let CURRENT_TAB = "network";

const dashboard = document.getElementById("dashboard");
const yearSel = document.getElementById("year");
const monthSel = document.getElementById("month");
const periodSel = document.getElementById("period");

/* =========================================================
   LOAD DATA
========================================================= */
async function loadReports() {
  const res = await fetch("data/reports.json");
  REPORTS = await res.json();
}
loadReports().then(initFilters);

/* =========================================================
   NAVIGATION
========================================================= */
document.querySelectorAll(".menu button").forEach(btn => {
  btn.onclick = () => {
    document.querySelectorAll(".menu button").forEach(b => b.classList.remove("active"));
    btn.classList.add("active");
    CURRENT_TAB = btn.dataset.tab;
    render();
  };
});

/* =========================================================
   FILTERS
========================================================= */
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

/* =========================================================
   RENDER ROUTER
========================================================= */
function render() {
  const item = REPORTS.find(r =>
    r.year === yearSel.value &&
    r.month === monthSel.value &&
    r.period === periodSel.value &&
    r.category === CURRENT_TAB
  );

  if (!item) {
    dashboard.innerHTML = "<p>No report for selected period.</p>";
    return;
  }

  if (CURRENT_TAB === "network") renderNetwork(item.data);
  if (CURRENT_TAB === "grants") renderGrants(item.data);
  if (CURRENT_TAB === "transparency") renderTransparency(item.data);
}

/* =========================================================
   UI HELPERS
========================================================= */
const card = (label, value) => `
<div class="card">
  <div class="label">${label}</div>
  <div class="value">${value ?? "—"}</div>
</div>`;

const section = (title, body) => `
<div class="section">
  <h2>${title}</h2>
  ${body}
</div>`;

const tableOrEmpty = (rows, colspan = 5) =>
  rows.length
    ? rows.join("")
    : `<tr><td colspan="${colspan}">No entries</td></tr>`;

/* =========================================================
   NETWORK REPORT
========================================================= */
function renderNetwork(d) {
  dashboard.innerHTML = `
${section("Market Snapshot", `
<div class="grid">
${card("VOI Price ($)", d.market_snapshot?.voi_price_usd)}
${card("Market Cap ($)", d.market_snapshot?.market_cap_usd)}
${card("Avg Block Time (s)", d.market_snapshot?.avg_block_time_seconds)}
</div>` )}

${section("Network Nodes", `
<div class="grid">
${card("Participating Nodes / Wallets", d.network_nodes?.participating_nodes_wallets)}
${card("Eligible Online Stake (VOI)", d.network_nodes?.eligible_online_stake_voi)}
${card("Weekly Staking Rewards (VOI)", d.network_nodes?.weekly_staking_rewards_voi)}
</div>
<p>${d.network_nodes?.insight || "—"}</p>` )}

${section("Relay Health & Changes", `
<div class="grid">
${card("Total Relays", d.relay_health_changes?.total_relays)}
${card("Qualified Relays", d.relay_health_changes?.qualified_relays)}
${card("Relays Added", d.relay_health_changes?.relays_added)}
${card("Relays Removed", d.relay_health_changes?.relays_removed)}
${card("Total Possible Peers", d.relay_health_changes?.total_possible_peers)}
</div>
<p><strong>Key Takeaway:</strong> ${d.relay_health_changes?.key_takeaway || "—"}</p>
<p><strong>Operational Note:</strong> ${d.relay_health_changes?.operational_note || "—"}</p>` )}

${section("Transaction Analysis — Overview", `
<div class="grid">
${card("Community Produced Blocks", d.transaction_analysis_overview?.community_produced_blocks)}
${card("Round Range Start", d.transaction_analysis_overview?.round_range_start)}
${card("Round Range End", d.transaction_analysis_overview?.round_range_end)}
${card("Number of Blocks", d.transaction_analysis_overview?.number_of_blocks)}
${card("Start Timestamp (UTC)", d.transaction_analysis_overview?.start_timestamp_utc)}
${card("End Timestamp (UTC)", d.transaction_analysis_overview?.end_timestamp_utc)}
</div>` )}

${section("Profitability — At a Glance", `
<div class="grid">
${card("Self-Hosted Node Cost ($)", d.profitability_at_a_glance?.self_hosted_node_cost_usd)}
${card("Stake Required (VOI)", d.profitability_at_a_glance?.stake_required_voi)}
${card("Estimated Monthly Profit ($)", d.profitability_at_a_glance?.estimated_monthly_profit_usd)}
${card("Node-as-a-Service Fee (%)", d.profitability_at_a_glance?.node_as_a_service_fee_percent)}
${card("Estimated Profit After Fee ($)", d.profitability_at_a_glance?.estimated_monthly_profit_after_fee_usd)}
</div>
<p><strong>Key Takeaway:</strong> ${d.profitability_at_a_glance?.key_takeaway || "—"}</p>` )}

${section("Transaction Breakdown", `
<div class="grid">
${card("Payment (pay)", d.transaction_breakdown?.payment_pay)}
${card("Application Call (appl)", d.transaction_breakdown?.application_call_appl)}
${card("Asset Transfer (axfer)", d.transaction_breakdown?.asset_transfer_axfer)}
${card("Asset Config (acfg)", d.transaction_breakdown?.asset_config_acfg)}
${card("Asset Freeze (afrz)", d.transaction_breakdown?.asset_freeze_afrz)}
${card("Application Create", d.transaction_breakdown?.application_create)}
${card("Application Update", d.transaction_breakdown?.application_update)}
${card("Application Delete", d.transaction_breakdown?.application_delete)}
${card("Inner Transactions", d.transaction_breakdown?.inner_transactions)}
</div>` )}

${section("Relay to Node Ratio", `
<div class="grid">
${card("Avg Peers per Relay", d.relay_to_node_ratio?.average_peers_per_relay)}
${card("Node : Relay Ratio", d.relay_to_node_ratio?.node_relay_ratio)}
${card("Reward per Peer (VOI)", d.relay_to_node_ratio?.reward_per_peer_voi)}
</div>
<p><strong>Key Takeaway:</strong> ${d.relay_to_node_ratio?.key_takeaway || "—"}</p>` )}

${section("Weekly Observations", `<p>${d.weekly_observations || "—"}</p>` )}

${section("Data Availability & Limitations", `<p>${d.data_availability_limitations || "—"}</p>` )}

${section("Summary", `
<div class="grid">
${card("Network Stability", d.summary?.network_stability)}
${card("Participation Trend", d.summary?.participation_trend)}
${card("Transaction Activity", d.summary?.transaction_activity)}
${card("Immediate Risks", d.summary?.immediate_risks)}
</div>` )}
`;
}

/* =========================================================
   GRANTS REPORT
========================================================= */
function renderGrants(d) {
  const rows = (d.grants_submitted_in_progress || []).map(p => `
<tr>
<td>${p.proposal_name}</td>
<td>${p.submitted_by}</td>
<td>${p.date_submitted}</td>
<td>${p.assigned_to}</td>
<td>${p.proposal_status}</td>
</tr>`);

  dashboard.innerHTML = `
${section("Monthly Snapshot", `
<div class="grid">
${card("Total Proposals", d.monthly_snapshot?.total_proposals_tracked)}
${card("New Submissions", d.monthly_snapshot?.new_submissions)}
${card("Under Review", d.monthly_snapshot?.under_review)}
${card("Approved", d.monthly_snapshot?.approved)}
${card("Funded", d.monthly_snapshot?.funded)}
</div>` )}

${section("Grants Submitted & In Progress", `
<table>
<tr><th>Proposal</th><th>Submitted By</th><th>Date</th><th>Assigned To</th><th>Status</th></tr>
${tableOrEmpty(rows)}
</table>` )}

${section("Highlights & Notes", `<p>${d.highlights_notes || "—"}</p>` )}
`;
}

/* =========================================================
   TRANSPARENCY REPORT
========================================================= */
function renderTransparency(d) {
  const rows = (d.community_ecosystem_payments || []).map(p => `
<tr>
<td>${p.date}</td>
<td>${p.recipient}</td>
<td>${p.amount_voi}</td>
<td>${p.purpose}</td>
<td>${p.source_wallet}</td>
</tr>`);

  dashboard.innerHTML = `
${section("Token Supply Summary", `
<div class="grid">
${card("Total Supply (VOI)", d.token_supply_summary?.total_supply_voi)}
${card("Circulating Supply", d.token_supply_summary?.circulating_supply_voi)}
${card("Unlocked Tokens", d.token_supply_summary?.unlocked_tokens_voi)}
${card("Locked Tokens", d.token_supply_summary?.locked_tokens_voi)}
</div>` )}

${section("Token Distribution Breakdown", `
<div class="grid">
${card("Community Allocation", d.token_distribution_breakdown?.community_allocation_voi)}
${card("Market Liquidity", d.token_distribution_breakdown?.market_liquidity_voi)}
${card("Ecosystem Incentives", d.token_distribution_breakdown?.ecosystem_incentives_voi)}
${card("Block Authority Allocation", d.token_distribution_breakdown?.block_authority_allocation_voi)}
${card("Other / Reserves", d.token_distribution_breakdown?.other_reserves_voi)}
</div>` )}

${section("Market Availability", `
<div class="grid">
${card("Tokens on CEX", d.market_availability?.tokens_on_cex_voi)}
${card("Tokens on DEX", d.market_availability?.tokens_on_dex_voi)}
${card("Total Liquidity", d.market_availability?.total_liquidity_voi)}
${card("FDV ($)", d.market_availability?.fdv_usd)}
${card("TDV ($)", d.market_availability?.tdv_usd)}
</div>` )}

${section("Community & Ecosystem Payments", `
<table>
<tr><th>Date</th><th>Recipient</th><th>Amount (VOI)</th><th>Purpose</th><th>Source Wallet</th></tr>
${tableOrEmpty(rows)}
</table>` )}

${section("Limitations & Disclaimers", `<p>${d.limitations_disclaimers || "—"}</p>` )}

${section("Summary", `
<div class="grid">
${card("Supply Transparency", d.summary?.supply_transparency)}
${card("Authority Spend Activity", d.summary?.authority_spend_activity)}
${card("Community Funding Health", d.summary?.community_funding_health)}
${card("Risks or Concerns", d.summary?.risks_or_concerns)}
</div>` )}
`;
}
