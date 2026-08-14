"use client";

import { Bar } from "react-chartjs-2";
import { GRID_COLOR, TICK, cursorPointerOnHover } from "@/lib/chartSetup";
import { usd, usdK } from "@/lib/format";
import { AGING_BUCKETS } from "@/lib/invoices";
import { SkeletonBars } from "../Skeleton";

/* Escalating urgency by bucket — amber for freshly overdue, darker red the longer it sits unpaid. */
const BUCKET_COLORS = {
  "0-30": "#f0a92b",
  "31-60": "#f2833c",
  "61-90": "#ef4d63",
  "90+": "#c62f4d",
  "No due date": "#8b95b2",
};

export default function ARAgingChart({ aging, loading = false, onSelect }) {
  const labels = [...AGING_BUCKETS, ...(aging["No due date"]?.total > 0 ? ["No due date"] : [])];
  const total = labels.reduce((sum, k) => sum + (aging[k]?.total || 0), 0);

  const data = {
    labels,
    datasets: [
      {
        data: labels.map((k) => aging[k]?.total || 0),
        backgroundColor: labels.map((k) => BUCKET_COLORS[k]),
        borderRadius: 6,
        maxBarThickness: 64,
        _rows: labels.map((k) => aging[k]?.rows || []),
      },
    ],
  };

  const options = {
    maintainAspectRatio: false,
    onHover: cursorPointerOnHover,
    onClick: (event, elements) => {
      if (!elements.length || !onSelect) return;
      const { index } = elements[0];
      onSelect(data.datasets[0]._rows[index], `Accounts Receivable — ${labels[index]}`);
    },
    plugins: {
      legend: { display: false },
      tooltip: {
        callbacks: {
          label: (c) => ` Overdue: ${usd(c.raw)}`,
          afterLabel: (c) => (c.dataset._rows[c.dataIndex] || []).slice(0, 12).map((r) => `• ${r.project} — ${r.task}: ${usd(r.invoiced)} · ${r.daysOverdue ?? "?"}d`),
        },
      },
    },
    scales: {
      y: { beginAtZero: true, grid: { color: GRID_COLOR }, border: { display: false }, ticks: { ...TICK, callback: (v) => usdK(v) } },
      x: { grid: { display: false }, border: { display: false }, ticks: TICK },
    },
  };

  return (
    <div className="panel">
      <div className="p-head">
        <div className="p-title">Accounts Receivable Aging</div>
        <div className="p-note">{loading ? "" : `${usd(total)} total overdue · click a bar for detail`}</div>
      </div>
      <div className="cbox">{loading ? <SkeletonBars count={4} /> : <Bar data={data} options={options} />}</div>
    </div>
  );
}
