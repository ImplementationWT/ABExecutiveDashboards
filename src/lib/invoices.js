import { monthRange, toUTCDate } from "./dates";

export const AGING_BUCKETS = ["0-30", "31-60", "61-90", "90+"];
const NO_DUE_DATE_BUCKET = "No due date";

/* Derives the [minMonth, maxMonth] bounds and the full ordered month list
   from whatever invoice dates are actually present. Computed at runtime
   (not a fixed static range) since invoices now come from a live snapshot
   that N8N can grow over time. */
export function computeMonthRange(invoices) {
  const months = new Set();
  invoices.forEach((r) => [r.invDate, r.paidDate, r.expDate].forEach((d) => d && months.add(d.slice(0, 7))));
  const sorted = [...months].sort();
  const minMonth = sorted[0] || null;
  const maxMonth = sorted[sorted.length - 1] || null;
  const monthsOrdered = minMonth && maxMonth ? monthRange(minMonth, maxMonth) : [];
  return { minMonth, maxMonth, monthsOrdered };
}

/* Best-available date used to bucket an invoice into a month for filtering. */
export function primaryMonth(row, fallbackMonth) {
  const d = row.paidDate || row.invDate || row.expDate;
  return d ? d.slice(0, 7) : fallbackMonth;
}

/* Groups overdue invoices into standard AR aging buckets by days past their
   expected (expDate) date. Overdue rows with no expDate at all fall into a
   separate "No due date" bucket rather than being dropped — so the total
   across every bucket always matches the "Amount Due" KPI exactly. Each
   bucket carries the actual matching invoice rows (not just a total) so the
   UI can show/click into the full list, not just a summary number. */
export function bucketAccountsReceivableAging(invoices, today = new Date()) {
  const buckets = {};
  [...AGING_BUCKETS, NO_DUE_DATE_BUCKET].forEach((k) => (buckets[k] = { total: 0, rows: [] }));

  invoices.forEach((r) => {
    if (r.status !== "Overdue") return;

    if (!r.expDate) {
      buckets[NO_DUE_DATE_BUCKET].total += r.invoiced;
      buckets[NO_DUE_DATE_BUCKET].rows.push(r);
      return;
    }

    const days = Math.floor((today - toUTCDate(r.expDate)) / 86400000);
    const bucket = days <= 30 ? "0-30" : days <= 60 ? "31-60" : days <= 90 ? "61-90" : "90+";
    buckets[bucket].total += r.invoiced;
    buckets[bucket].rows.push({ ...r, daysOverdue: days });
  });

  return buckets;
}
