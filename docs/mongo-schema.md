# Mongo snapshot schema — what each N8N workflow needs to write

Each monday.com board writes **a single document** to its collection, keyed
by its own `docId` field fixed at `"latest"` (not Mongo's native `_id` — N8N's
Mongo node doesn't give reliable control over `_id` on upsert, so a plain
text field is used instead; `_id` is just whatever Mongo assigns as usual).
Each sync does an `upsert` filtered on `docId` (replaces the whole document)
— no history is kept, just the latest snapshot.

| Board (monday.com) | Mongo collection      | Read endpoint              | Triggered by "Refresh" via         |
| ------------------- | ---------------------- | --------------------------- | ------------------------------------ |
| Planning & Design   | `planning_snapshot`    | `GET /api/data/planning`    | `N8N_WEBHOOK_PLANNING`               |
| Financial            | `financial_snapshot`   | `GET /api/data/financial`   | `N8N_WEBHOOK_FINANCIAL`              |
| Sales                 | `sales_snapshot`        | `GET /api/data/sales`       | `N8N_WEBHOOK_SALES`                  |

Database: whatever `MONGODB_DB` is set to (`.env.local`).

The dashboard's "Refresh" button `POST`s to `/api/sync/[board]`, which calls
that board's N8N webhook URL (from the env vars above, `.env.local`) and
waits for it to respond before re-reading Mongo — see
`src/app/api/sync/[board]/route.js`. This assumes the webhook is configured
to respond only once the workflow finishes writing to Mongo; if it responds
immediately instead, the dashboard may briefly show the previous snapshot
right after a refresh.

⚠️ **The shape below must match exactly** — the frontend reads these fields
by name with no transformation. If a field is missing or misnamed, that
chart/table breaks or shows empty, with no visible error.

---

## Gotcha #1 — there are two different date formats

- **Short dates without a year** (`"Jun 15"`, `"Jul 21"`, `"Dec 8"`): used in
  `tasksDueThisWeek`, `tasksDueNextWeek`, `inProgress` (start/finish). These
  are display-only text, never parsed.
- **Full ISO dates** (`"2026-07-21"`, `YYYY-MM-DD` format): used in `gantt`
  (start/finish/baseline) and throughout `financial.invoices`
  (invDate/paidDate/expDate). These **are** parsed (to compute the Gantt
  axis, sort by month, etc.) — if they don't come in exactly as
  `YYYY-MM-DD`, the calculation breaks.

## Gotcha #2 — names that must match hardcoded colors

The frontend has fixed color maps in `src/lib/format.js`:

- `PERSON_COLORS` — one color per person (`owner` in planning, avatars).
- `SOURCE_COLORS` — one color per lead source (sales pie charts).
- `STAGE_COLORS` — one color per stage (the "Stage" column in `inProgress`).

If a workflow sends an `owner`, `source`, or `stage` that isn't in those
maps, nothing breaks — it just shows up in a generic gray (`#888`) instead
of its assigned color. If you add new people/sources/stages and want their
own color, let me know so it can be added to the map in code.

---

## `planning_snapshot`

```jsonc
{
  "docId": "latest",
  "updatedAt": "2026-08-11T23:14:08.725Z", // ISO datetime, when the sync ran

  // Every project name that exists — feeds the filters
  "projects": ["10303 Whipple St", "850 Hartzell St", "469 17th St"],

  // Every owner/assignee name that exists — feeds the filters
  "owners": ["Allan Cerna", "Anahit Stepanyan", "Vardan Hambardzumyan"],

  // One entry per overdue task
  "overdue": [
    {
      "owner": "Anahit Stepanyan",
      "project": "469 17th St",
      "task": "Collect payment upon completion of floor plans",
      "days": 120 // days overdue, positive integer
    }
  ],

  // Tasks due this week. "days" is ALWAYS 5 labels (Mon-Fri).
  "tasksDueThisWeek": {
    "days": ["Jun 15", "Jun 16", "Jun 17", "Jun 18", "Jun 19"],
    "records": [
      {
        "d": 0, // index 0-4 into "days" -> which of those 5 days
        "owner": "Harut Arzumanyan",
        "project": "1425 Rexford Ave",
        "task": "Construction budget approved"
      }
    ]
  },

  // Same shape as tasksDueThisWeek, but next week
  "tasksDueNextWeek": {
    "days": ["Jun 22", "Jun 23", "Jun 24", "Jun 25", "Jun 26"],
    "records": [{ "d": 0, "owner": "...", "project": "...", "task": "..." }]
  },

  // NOTE: these are TUPLES (positional arrays), not objects.
  // Fixed order: [task, owner, project, start, finish, stage]
  "inProgress": [
    [
      "Obtain approved plans, permits & clearances", // task
      "Allan Cerna", // owner
      "1425 Rexford Ave", // project
      "Dec 8", // start (short date, no year)
      "Jul 21", // finish (short date, no year)
      "Project Planning" // stage — see STAGE_COLORS for valid names
    ]
  ],

  // Task count by status, one entry per project
  "completion": [
    {
      "project": "1425 Rexford Ave",
      "d": 39, // done / completed
      "s": 0, // scheduled
      "p": 0, // in progress
      "u": 0 // past due / overdue
    }
  ],

  // Schedule variance in working days vs. estimate. Negative = behind.
  "variance": [{ "project": "10303 Whipple St", "days": -250 }],

  // Config for the 4 Gantt groups/phases (rarely changes)
  "ganttGroups": [
    { "name": "Floor Plans & Elevations", "color": "#c97b54" },
    { "name": "Engineering & Design / City Submission", "color": "#2bc4c7" },
    { "name": "Modeling & Design Book", "color": "#a855f7" },
    { "name": "Takeoff / Budgeting & Contract", "color": "#f0a92b" }
  ],

  // One row per project in the Gantt. FULL ISO DATES here (YYYY-MM-DD).
  "gantt": [
    {
      "project": "1105 Monument St",
      "group": "Floor Plans & Elevations", // must match a name in ganttGroups
      "start": "2026-04-07",
      "finish": "2026-11-04",
      "baseline": "2026-12-09", // originally planned finish date
      "variance": 25 // working days, actual finish vs. baseline, signed
    }
  ]
}
```

---

## `financial_snapshot`

```jsonc
{
  "docId": "latest",
  "updatedAt": "2026-08-11T23:14:08.725Z",

  // One entry per invoice line / payment milestone
  "invoices": [
    {
      "project": "871 El Oro Ln",
      "status": "Completed", // "Completed" | "Scheduled" | "Overdue" | "Invoice Sent" | "Due"
      "invoiced": 1000, // billed amount (USD, number)
      "received": 1000, // amount actually collected (0 if unpaid)
      "invDate": "2026-04-17", // date it was invoiced — YYYY-MM-DD or null
      "paidDate": null, // date it was paid — YYYY-MM-DD or null
      "expDate": "2026-04-24", // expected/milestone date — YYYY-MM-DD or null
      "task": "Approved plans & permits" // milestone name
    }
  ]
}
```

Notes:
- `status: "Scheduled"` is what feeds "Expected Cash Inflow" (uses
  `expDate`). If it has no `expDate`, it won't show up in that chart.
- `invDate` feeds "Monthly Billing vs Payments" — both bars (Billed and
  Received) are grouped by `invDate`, matching monday.com's own widget (not
  by `paidDate` — that field isn't populated on the board yet). If `invDate`
  is `null`, that invoice doesn't count in that chart (but it still counts
  in the totals/KPIs). `paidDate` stays in the schema in case a "when did
  the money actually land" chart gets built later (would need that field
  populated).

---

## `sales_snapshot`

```jsonc
{
  "docId": "latest",
  "updatedAt": "2026-08-11T23:14:08.725Z",

  // Current pipeline snapshot (deals in "Client Proposal Review"), not per-year
  "pending": {
    "value": 9507000, // $ sum of all pending deals
    "count": 6, // count of pending deals
    "phase1": 544000, // $ sum of the ones that are Phase 1
    "phase2": 8963000 // $ sum of the ones that are Phase 2
  },

  // One block per calendar year
  "byYear": {
    "2026": {
      "closed": [0, 0, 0, 4, 1, 0, 0, 0, 0, 0, 0, 0], // deals closed per month, Jan-Dec, always 12 numbers
      "totalValue": 9135895, // $ total of deals closed that year
      "count": 5, // count of closed deals
      "phase1": 299450, // $ of closed deals that are Phase 1
      "phase2": 8836445, // $ of closed deals that are Phase 2
      "newTotal": 67, // count of NEW deals created that year (top of funnel)

      // count of new deals by source — [name, count] pairs
      "newSource": [
        ["Cold Call", 10],
        ["Referral", 8]
      ],
      // count of closed deals by source — same format
      "closedSource": [
        ["Referral", 2],
        ["Cold Call", 1]
      ],

      // addresses of deals closed per month — array of 12 arrays, parallel to "closed"
      "closedAddr": [
        [], [], [],
        ["930 Galloway Street", "18361 Clifftop Way"], // example: April
        [], [], [], [], [], [], [], []
      ],

      // addresses grouped by source (for tooltip detail)
      "newSourceAddr": {
        "Cold Call": ["614 Swarthmore Ave", "333 Beirut Ave"],
        "Referral": ["1132 Las Pulgas Rd"]
      },
      "closedSourceAddr": {
        "Referral": ["18361 Clifftop Way", "545 Muskingum Pl"]
      }
    },
    "2025": { "...": "same shape as 2026" }
  },

  // The full CRM pipeline broken down by stage — feeds the "Pipeline by
  // Stage" chart. One entry per monday.com pipeline stage; order doesn't
  // matter, the chart sorts by count itself.
  "byStage": [
    {
      "stage": "Long Term Leads", // exact monday.com stage name
      "count": 56, // number of deals in this stage
      "value": 41820625, // $ sum across every deal in this stage
      "phase1": 1046955, // $ sum of the Phase 1 portion
      "phase2": 40773670, // $ sum of the Phase 2 portion

      // one entry per individual deal in this stage — shown in the modal
      // when someone clicks this stage's bar on the chart
      "deals": [
        {
          "project": "521 N Marquette St, Pacific Palisades, CA 90272", // address
          "value": 300000, // total deal $ value
          "phase1": 50000,
          "phase2": 250000
        }
      ]
    }
  ]
}
```

Notes:
- `stage` drives the bar color (see `PIPELINE_STAGE_COLORS` in
  `src/lib/format.js` — currently has entries for `New Deal`,
  `Client Discovery`, `Create Proposal`, `Client Proposal Review`,
  `Deal Won`, `Deals Lost`, `Long Term Leads`). Any other stage name just
  renders in a generic gray, nothing breaks — ping me to add a color for a
  new stage.
- `count` and `value` at the stage level should always equal the sum of
  their respective fields across that stage's own `deals` array — if they
  drift apart, something's off in how the workflow rolled them up.
- This is independent of `pending` and `byYear` above — those stay as they
  are for the existing cards/charts. `byStage` is only consumed by the new
  "Pipeline by Stage" chart.

---

## How to test a document before the real workflow exists

While each workflow is being built, you can write directly to Mongo
(Compass, `mongosh`, or an N8N HTTP node against your own endpoint) and
verify with:

```bash
curl http://localhost:3000/api/data/planning
curl http://localhost:3000/api/data/financial
curl http://localhost:3000/api/data/sales
```

If something doesn't show up on the dashboard, compare the real document in
Mongo against the shape above — it's almost always a differently-named field
or a mixed-up date format (gotcha #1).
