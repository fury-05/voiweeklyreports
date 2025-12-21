let CURRENT_TAB = "network";

const dashboard = document.getElementById("dashboard");
const yearSel = document.getElementById("year");
const monthSel = document.getElementById("month");
const periodSel = document.getElementById("period");

document.querySelectorAll(".menu button").forEach(b => {
  b.onclick = () => {
    document.querySelectorAll(".menu button").forEach(x => x.classList.remove("active"));
    b.classList.add("active");
    CURRENT_TAB = b.dataset.tab;
    render();
  };
});

loadReports().then(initFilters);

function initFilters() {
  if (!REPORTS.length) {
    dashboard.innerHTML = "No reports available.";
    return;
  }

  const years = [...new Set(REPORTS.map(r => r.year))];
  yearSel.innerHTML = years.map(y => `<option>${y}</option>`).join("");
  yearSel.onchange = updateMonths;

  updateMonths();
}

function updateMonths() {
  const months = [...new Set(
    REPORTS.filter(r => r.year == yearSel.value).map(r => r.month)
  )];
  monthSel.innerHTML = months.map(m => `<option>${m}</option>`).join("");
  monthSel.onchange = updatePeriods;
  updatePeriods();
}

function updatePeriods() {
  const periods = [...new Set(
    REPORTS.filter(r =>
      r.year == yearSel.value &&
      r.month == monthSel.value
    ).map(r => r.period)
  )];
  periodSel.innerHTML = periods.map(p => `<option>${p}</option>`).join("");
  render();
}

function render() {
  const item = REPORTS.find(r =>
    r.year == yearSel.value &&
    r.month == monthSel.value &&
    r.period == periodSel.value &&
    r.category == CURRENT_TAB
  );

  if (!item) {
    dashboard.innerHTML = "No data for selected period.";
    return;
  }

  if (CURRENT_TAB === "network") renderNetwork(item.data);
  else dashboard.innerHTML = "Renderer pending.";
}

/* ---------- UI HELPERS ---------- */
function card(label, value) {
  return `
    <div class="card">
      <div class="label">${label}</div>
      <div class="value">${value ?? "—"}</div>
    </div>`;
}

function section(title, content) {
  return `
    <div class="section">
      <h2>${title}</h2>
      ${content}
    </div>`;
}

function paragraph(text) {
  return text ? `<p>${text}</p>` : "";
}

/* ---------- FULL NETWORK RENDER ---------- */
function renderNetwork(d) {
  dashboard.innerHTML = `

${section("Market Snapshot", `
  <div class="grid">
    ${card("VOI Price ($)", d.market_snapshot?.voi_price_usd)}
    ${card("Market Cap ($)", d.market_snapshot?.market_cap_usd)}
    ${card("Average Block Time (s)", d.market_snapshot?.avg_block_time_seconds)}
  </div>
`)}

${section("Network Nodes", `
  <div class="grid">
    ${card("Participating Nodes / Wallets", d.network_nodes?.participating_nodes_or_wallets)}
    ${card("Eligible Online Stake (VOI)", d.network_nodes?.eligible_online_stake_voi)}
    ${card("Weekly Staking Rewards (VOI)", d.network_nodes?.weekly_staking_rewards_voi)}
  </div>
  ${paragraph(d.network_nodes?.insight)}
`)}

${section("Relay Health & Changes", `
  <div class="grid">
    ${card("Total Relays", d.relay_health_changes?.total_relays)}
    ${card("Qualified Relays", d.relay_health_changes?.qualified_relays)}
    ${card("Relays Added", d.relay_health_changes?.relays_added)}
    ${card("Relays Removed", d.relay_health_changes?.relays_removed)}
    ${card("Total Possible Peers", d.relay_health_changes?.total_possible_peers)}
  </div>
  ${paragraph(`<strong>Key Takeaway:</strong> ${d.relay_health_changes?.key_takeaway}`)}
  ${paragraph(d.relay_health_changes?.operational_note)}
`)}

${section("Transaction Analysis — Overview", `
  <div class="grid">
    ${card("Community Produced Blocks", d.transaction_analysis_overview?.community_produced_blocks)}
    ${card("Round Range Start", d.transaction_analysis_overview?.round_range_start)}
    ${card("Round Range End", d.transaction_analysis_overview?.round_range_end)}
    ${card("Number of Blocks", d.transaction_analysis_overview?.number_of_blocks)}
    ${card("Start Timestamp (UTC)", d.transaction_analysis_overview?.start_timestamp_utc)}
    ${card("End Timestamp (UTC)", d.transaction_analysis_overview?.end_timestamp_utc)}
  </div>
`)}

${section("Profitability — At a Glance", `
  <div class="grid">
    ${card("Self-Hosted Node Cost ($)", d.profitability_at_a_glance?.self_hosted_node_cost_usd)}
    ${card("Stake Required (VOI)", d.profitability_at_a_glance?.stake_required_voi)}
    ${card("Estimated Monthly Profit ($)", d.profitability_at_a_glance?.estimated_monthly_profit_usd)}
    ${card("Node-as-a-Service Fee (%)", d.profitability_at_a_glance?.node_as_a_service_fee_percent)}
    ${card("Estimated Monthly Profit After Fee ($)", d.profitability_at_a_glance?.estimated_monthly_profit_after_fee_usd)}
  </div>
  ${paragraph(`<strong>Key Takeaway:</strong> ${d.profitability_at_a_glance?.key_takeaway}`)}
`)}

${section("Transaction Breakdown", `
  <table>
    <tr><th>Transaction Type</th><th>Count</th></tr>
    ${Object.entries(d.transaction_breakdown || {}).map(
      ([k,v]) => `<tr><td>${k}</td><td>${v}</td></tr>`
    ).join("")}
  </table>
`)}

${section("Relay to Node Ratio", `
  <div class="grid">
    ${card("Average Peers per Relay", d.relay_to_node_ratio?.avg_peers_per_relay)}
    ${card("Node : Relay Ratio", d.relay_to_node_ratio?.node_to_relay_ratio)}
    ${card("Reward per Peer (VOI)", d.relay_to_node_ratio?.reward_per_peer_voi)}
  </div>
  ${paragraph(`<strong>Key Takeaway:</strong> ${d.relay_to_node_ratio?.key_takeaway}`)}
`)}

${section("Weekly Observations", `
  ${paragraph(d.weekly_observations?.observations)}
`)}

${section("Data Availability & Limitations", `
  ${paragraph(d.data_availability_limitations?.notes)}
`)}

${section("Summary", `
  <div class="grid">
    ${card("Network Stability", d.summary?.network_stability)}
    ${card("Participation Trend", d.summary?.participation_trend)}
    ${card("Transaction Activity", d.summary?.transaction_activity)}
    ${card("Immediate Risks", d.summary?.immediate_risks)}
  </div>
`)}

`;
}
