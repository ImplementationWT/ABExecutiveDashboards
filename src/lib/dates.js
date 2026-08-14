/* Date helpers shared by the Gantt timeline and the financial month filters.
   Dates are plain "YYYY-MM-DD" strings parsed as UTC to avoid local-timezone drift. */

export const toUTCDate = (isoDate) => new Date(isoDate + "T00:00:00Z");

export const fmtD = (isoDate) =>
  toUTCDate(isoDate).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    timeZone: "UTC",
  });

export const fmtDY = (isoDate) =>
  toUTCDate(isoDate).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "2-digit",
    timeZone: "UTC",
  });

export function workingDays(a, b) {
  let start = toUTCDate(a);
  let end = toUTCDate(b);
  if (end < start) [start, end] = [end, start];
  let count = 0;
  const cursor = new Date(start);
  while (cursor <= end) {
    const wd = cursor.getUTCDay();
    if (wd !== 0 && wd !== 6) count++;
    cursor.setUTCDate(cursor.getUTCDate() + 1);
  }
  return count;
}

export const MONTH_ABBR = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

/* "YYYY-MM" -> "Jun '26" */
export const monthLabel = (yyyyMm) => {
  const [y, m] = yyyyMm.split("-");
  return MONTH_ABBR[+m - 1] + " '" + y.slice(2);
};

export const formatSyncTimestamp = (iso) =>
  new Date(iso).toLocaleString("en-US", {
    timeZone: "America/Los_Angeles",
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    timeZoneName: "short",
  });

/* Inclusive list of "YYYY-MM" strings between two "YYYY-MM" bounds. */
export function monthRange(minMonth, maxMonth) {
  const out = [];
  let [y, m] = minMonth.split("-").map(Number);
  const [ey, em] = maxMonth.split("-").map(Number);
  while (y < ey || (y === ey && m <= em)) {
    out.push(`${y}-${String(m).padStart(2, "0")}`);
    if (++m > 12) {
      m = 1;
      y++;
    }
  }
  return out;
}
