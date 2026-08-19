"use client";

import { useCallback, useMemo, useState } from "react";
import { BILLED_STATUSES, statusMetaFor } from "@/lib/format";
import { monthLabel } from "@/lib/dates";
import { computeMonthRange, primaryMonth, bucketAccountsReceivableAging, distinctStatuses } from "@/lib/invoices";
import { useMultiSelect } from "../filters/useMultiSelect";
import MultiSelectDropdown from "../filters/MultiSelectDropdown";
import KpiCards from "./KpiCards";
import ARAgingChart from "./ARAgingChart";
import ProjectInvoicesChart from "./ProjectInvoicesChart";
import MonthlyBillingChart from "./MonthlyBillingChart";
import InflowChart from "./InflowChart";
import FinancialPaneSkeleton from "./FinancialPaneSkeleton";
import InvoiceDetailModal from "./InvoiceDetailModal";

function bucketByMonth(rows, dateKey, valueKey) {
  const buckets = {};
  rows.forEach((r) => {
    const date = r[dateKey];
    if (!date) return;
    const month = date.slice(0, 7);
    const entry = (buckets[month] = buckets[month] || { total: 0, rows: [] });
    entry.total += r[valueKey];
    entry.rows.push(r);
  });
  return buckets;
}

/* `data` is the financial_snapshot document from /api/data/financial (see
   docs/mongo-schema.md). Before it has loaded once, there's no project list
   or month range yet to build the filters from, so we show a full-pane
   skeleton instead — see FinancialPaneSkeleton. */
export default function FinancialPane({ data, loading = false, error = null }) {
  if (!data) {
    return <FinancialPaneSkeleton error={error} />;
  }
  return <FinancialPaneContent data={data} loading={loading} />;
}

function FinancialPaneContent({ data, loading }) {
  const INVOICES = data.invoices;
  const PROJECTS = useMemo(() => [...new Set(INVOICES.map((r) => r.project))].sort(), [INVOICES]);
  const STATUSES = useMemo(() => distinctStatuses(INVOICES), [INVOICES]);
  const { minMonth: MIN_MONTH, maxMonth: MAX_MONTH, monthsOrdered: MONTHS_ORDERED } = useMemo(() => computeMonthRange(INVOICES), [INVOICES]);

  const projectFilter = useMultiSelect(PROJECTS, "All projects");
  const statusFilter = useMultiSelect(STATUSES, "All statuses");
  const [fromMonth, setFromMonth] = useState(MIN_MONTH);
  const [toMonth, setToMonth] = useState(MAX_MONTH);
  const [selection, setSelection] = useState(null);

  const onSelect = useCallback((rows, title) => setSelection({ rows, title }), []);

  function resetFilters() {
    projectFilter.reset();
    statusFilter.reset();
    setFromMonth(MIN_MONTH);
    setToMonth(MAX_MONTH);
  }

  const inRange = useCallback((month) => month && month >= fromMonth && month <= toMonth, [fromMonth, toMonth]);

  const allFiltered = useMemo(() => INVOICES.filter((r) => projectFilter.selected.has(r.project)), [INVOICES, projectFilter.selected]);

  const kpis = useMemo(() => {
    let totalInvoiced = 0;
    let totalReceived = 0;
    let totalDue = 0;
    let upcoming = 0;
    allFiltered.forEach((r) => {
      totalInvoiced += r.invoiced;
      totalReceived += r.received;
      if (r.status === "Overdue") totalDue += r.invoiced;
      if (r.status === "Scheduled") upcoming += r.invoiced;
    });
    return { totalInvoiced, totalReceived, totalDue, upcoming };
  }, [allFiltered]);

  const aging = useMemo(() => bucketAccountsReceivableAging(allFiltered), [allFiltered]);

  /* Per-project stacked totals across every filterable status (Completed/Sent/Overdue/Scheduled).
     statusRows carries the actual invoice rows per status so chart clicks can open the full detail. */
  const projectRows = useMemo(() => {
    const byProject = {};
    allFiltered.forEach((r) => {
      if (!statusFilter.selected.has(r.status)) return;
      const bucket = (byProject[r.project] = byProject[r.project] || { byStatus: {}, statusRows: {} });
      bucket.byStatus[r.status] = (bucket.byStatus[r.status] || 0) + r.invoiced;
      (bucket.statusRows[r.status] = bucket.statusRows[r.status] || []).push(r);
    });
    return Object.entries(byProject)
      .map(([project, { byStatus, statusRows }]) => ({ project, byStatus, statusRows, total: Object.values(byStatus).reduce((a, b) => a + b, 0) }))
      .sort((a, b) => b.total - a.total);
  }, [allFiltered, statusFilter.selected]);

  /* Monthly billing vs payments and expected inflow respect the month-range filter. */
  const allRowsInRange = useMemo(
    () => INVOICES.filter((r) => projectFilter.selected.has(r.project) && inRange(primaryMonth(r, MIN_MONTH))),
    [INVOICES, projectFilter.selected, inRange, MIN_MONTH]
  );
  const billedRows = useMemo(
    () => allRowsInRange.filter((r) => BILLED_STATUSES.includes(r.status) && statusFilter.selected.has(r.status)),
    [allRowsInRange, statusFilter.selected]
  );
  const scheduledRows = useMemo(
    () => INVOICES.filter((r) => r.status === "Scheduled" && projectFilter.selected.has(r.project) && r.expDate && inRange(r.expDate.slice(0, 7))),
    [INVOICES, projectFilter.selected, inRange]
  );

  /* Both series bucket by invoice date (matching monday.com's own widget) —
     "Received" here means "collected so far, of what was billed that month",
     not "cash that landed in that calendar month" (which would need a
     reliable paidDate, still unpopulated in the source data). */
  const billedByInvDate = useMemo(() => {
    const inRangeRows = billedRows.filter((r) => r.invDate && inRange(r.invDate.slice(0, 7)));
    return bucketByMonth(inRangeRows, "invDate", "invoiced");
  }, [billedRows, inRange]);
  const paidByInvDate = useMemo(() => {
    const inRangeRows = billedRows.filter((r) => r.invDate && inRange(r.invDate.slice(0, 7)));
    return bucketByMonth(inRangeRows, "invDate", "received");
  }, [billedRows, inRange]);
  const inflowByExpDate = useMemo(() => bucketByMonth(scheduledRows, "expDate", "invoiced"), [scheduledRows]);

  const billingMonths = MONTHS_ORDERED.filter((m) => inRange(m) && (billedByInvDate[m] || paidByInvDate[m]));
  const inflowMonths = MONTHS_ORDERED.filter((m) => inRange(m) && inflowByExpDate[m]);

  return (
    <>
      <div className="filterbar">
        <MultiSelectDropdown
          label="Projects"
          items={PROJECTS}
          selected={projectFilter.selected}
          summary={projectFilter.label}
          onToggleAll={projectFilter.toggleAll}
          onToggleOne={projectFilter.toggleOne}
        />
        <MultiSelectDropdown
          label="Status"
          items={STATUSES}
          itemLabel={(k) => statusMetaFor(k).label}
          selected={statusFilter.selected}
          summary={statusFilter.label}
          onToggleAll={statusFilter.toggleAll}
          onToggleOne={statusFilter.toggleOne}
        />
        <div className="field">
          <label>From month</label>
          <select value={fromMonth} onChange={(e) => setFromMonth(e.target.value)}>
            {MONTHS_ORDERED.map((m) => (
              <option key={m} value={m}>
                {monthLabel(m)}
              </option>
            ))}
          </select>
        </div>
        <div className="field">
          <label>To month</label>
          <select value={toMonth} onChange={(e) => setToMonth(e.target.value)}>
            {MONTHS_ORDERED.map((m) => (
              <option key={m} value={m}>
                {monthLabel(m)}
              </option>
            ))}
          </select>
        </div>
        <button type="button" className="reset" onClick={resetFilters}>
          Reset filters
        </button>
      </div>

      <KpiCards {...kpis} loading={loading} />

      <div className="sec-title">Financial overview by project</div>
      <ProjectInvoicesChart rows={projectRows} loading={loading} onSelect={onSelect} />

      <div className="sec-title">Accounts receivable</div>
      <ARAgingChart aging={aging} loading={loading} onSelect={onSelect} />

      <div className="grid g2" style={{ marginTop: 16 }}>
        <MonthlyBillingChart months={billingMonths} billed={billedByInvDate} paid={paidByInvDate} loading={loading} onSelect={onSelect} />
        <InflowChart months={inflowMonths} inflow={inflowByExpDate} loading={loading} onSelect={onSelect} />
      </div>

      <InvoiceDetailModal selection={selection} onClose={() => setSelection(null)} />
    </>
  );
}