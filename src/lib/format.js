export const usd = (n) => "$" + Math.round(n).toLocaleString("en-US");

export const usdK = (n) => "$" + Math.round(n / 1000) + "k";

export const initials = (name) =>
  name
    .split(" ")
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

/* Deterministic fallback color for any value that isn't in a known color
   map — a new owner, lead source, stage, pipeline stage, or invoice status
   the board adds later. Hashes the name so the same unknown value always
   gets the same color (stable across reloads), instead of every unmapped
   value collapsing into one flat gray. Prefer this over `MAP[x] || "#888"`
   anywhere a value comes from live data rather than a fixed enum. */
const FALLBACK_PALETTE = ["#8b95b2", "#22c55e", "#eab308", "#06b6d4", "#f43f5e", "#a3e635", "#fb923c", "#c084fc"];
function hashString(s) {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) | 0;
  return Math.abs(h);
}
export function colorFor(name, knownColors) {
  return knownColors[name] || FALLBACK_PALETTE[hashString(name) % FALLBACK_PALETTE.length];
}

/* Per-person accent color, used for avatars, legends and stacked bars. */
export const PERSON_COLORS = {
  "Allan Cerna": "#4a90e2",
  "Anahit Stepanyan": "#f4c430",
  "Armine Beybutyan": "#a855f7",
  "Harut Arzumanyan": "#ec4899",
  "Jack Seferian": "#22c55e",
  "Oroneil Fantone": "#14b8a6",
  "Satenik Khandamyan": "#f97316",
  "Vardan Hambardzumyan": "#e0556b",
  "Andrew Vaitkevicius": "#5b8def",
};

/* Deal-source accent color, used for the sales pie charts. */
export const SOURCE_COLORS = {
  "Cold Call": "#4a90e2",
  Referral: "#f4c430",
  Signs: "#a855f7",
  "Direct Mail": "#ec4899",
  "Real Estate": "#22c55e",
  "Email Marketing": "#38bdf8",
  "AB Events": "#f97316",
  "AI Search": "#14b8a6",
  Website: "#8b5cf6",
  "AB Staff Referral": "#f43f5e",
  "Online Search": "#06b6d4",
  "Past Client": "#eab308",
};

export const STAGE_COLORS = {
  "Floor Plans & Elevations": "#579bfc",
  "City Plan Check Submission & Permitting": "#ff7575",
  "Structural Bidding": "#216edf",
  "Budgeting & Contract": "#ff5ac4",
  "Project Planning": "#00c875",
};

/* Shortens the long monday.com stage labels for the in-progress table. */
export const shortStage = (stage) =>
  stage
    .replace("City Plan Check Submission & Permitting", "City Plan Check")
    .replace("Floor Plans & Elevations", "Floor Plans");

/* The 4 statuses that actually exist on the Financial board's Status column
   (confirmed against live monday.com data — no "Due" status exists there). */
export const STATUS_META = {
  Completed: { label: "Completed", color: "#2bd49b" },
  "Invoice Sent": { label: "Sent", color: "#f0a92b" },
  Overdue: { label: "Overdue", color: "#ef4d63" },
};

/* "Billed" statuses — used specifically where "has this actually been
   invoiced yet" matters (e.g. Monthly Billing vs Payments always excludes
   Scheduled regardless of the status filter, since nothing's been billed). */
export const BILLED_STATUSES = Object.keys(STATUS_META);

/* Known/preferred label+color for statuses, incl. Scheduled (not billed yet,
   but still a real, filterable status on the board). This is NOT the source
   of truth for which statuses exist — that's always derived from the actual
   invoices (see distinctStatuses in lib/invoices.js) so a status added or
   renamed on the board shows up automatically. This is just styling: a
   status not listed here still works fine via statusMetaFor's fallback. */
export const ALL_STATUS_META = {
  ...STATUS_META,
  Scheduled: { label: "Scheduled", color: "#4a90e2" },
};

/* Label+color for any status, known or not — known statuses get their
   preferred styling above, anything else gets its raw name as the label and
   a stable auto-assigned color via colorFor. */
export function statusMetaFor(status) {
  return ALL_STATUS_META[status] || { label: status, color: colorFor(status, {}) };
}

/* Orders a set of status strings for display: known statuses first, in their
   preferred order, then anything unrecognized appended alphabetically — so a
   new/renamed status still shows up, just at the end. Shared by the status
   filter (over all invoices) and the per-project chart (over whatever
   statuses survive the current filters). */
export function orderStatuses(statuses) {
  const present = new Set(statuses);
  const known = Object.keys(ALL_STATUS_META).filter((s) => present.has(s));
  const unknown = [...present].filter((s) => !ALL_STATUS_META[s]).sort();
  return [...known, ...unknown];
}

/* Fixed funnel order for the sales "Pipeline by Stage" chart (top to
   bottom), not sorted by count — matches how the team actually walks a deal
   through the pipeline. Any stage name not listed here sorts to the end,
   after everything recognized. */
export const PIPELINE_STAGE_ORDER = [
  "New Deal",
  "Client Discovery",
  "Create Proposal",
  "Client Proposal Review",
  "Deal Closing",
  "Deal Won",
  "Long Term Leads",
  "Deals Lost",
];

/* CRM pipeline stage color for the same chart — blues/purple through the
   active funnel, teal at closing, green for won, gold for parked long-term
   leads, red for lost. Any stage name not listed here (monday.com stage
   names can change) just falls back to a generic gray, nothing breaks. */
export const PIPELINE_STAGE_COLORS = {
  "New Deal": "#4a90e2",
  "Client Discovery": "#5b8def",
  "Create Proposal": "#a855f7",
  "Client Proposal Review": "#8b5cf6",
  "Deal Closing": "#14b8a6",
  "Deal Won": "#2bd49b",
  "Long Term Leads": "#f4c430",
  "Deals Lost": "#ef4d63",
};