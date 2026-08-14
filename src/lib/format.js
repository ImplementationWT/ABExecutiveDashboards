export const usd = (n) => "$" + Math.round(n).toLocaleString("en-US");

export const usdK = (n) => "$" + Math.round(n / 1000) + "k";

export const initials = (name) =>
  name
    .split(" ")
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

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

export const STATUS_META = {
  Completed: { label: "Completed", color: "#2bd49b" },
  "Invoice Sent": { label: "Sent", color: "#4a90e2" },
  Overdue: { label: "Overdue", color: "#ef4d63" },
  Due: { label: "Past due", color: "#f0a92b" },
};

/* "Billed" statuses shown in the financial status filter — Scheduled is tracked separately (not yet billed). */
export const BILLED_STATUSES = Object.keys(STATUS_META);

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
