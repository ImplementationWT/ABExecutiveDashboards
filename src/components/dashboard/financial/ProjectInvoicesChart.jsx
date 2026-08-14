"use client";

import { Bar } from "react-chartjs-2";
import { GRID_COLOR, TICK, cursorPointerOnHover } from "@/lib/chartSetup";
import { usd, usdK } from "@/lib/format";
import { SkeletonHBars } from "../Skeleton";

const STATUS_DATASETS = [
  { key: "Completed", label: "Completed", color: "#2bd49b" },
  { key: "Overdue", label: "Overdue", color: "#ef4d63" },
  { key: "Scheduled", label: "Scheduled", color: "#4a90e2" },
];

export default function ProjectInvoicesChart({ rows, loading = false, onSelect }) {
  const data = {
    labels: rows.map((r) => r.project),
    datasets: STATUS_DATASETS.map((s) => ({
      label: s.label,
      data: rows.map((r) => r.byStatus[s.key] || 0),
      backgroundColor: s.color,
      _rows: rows.map((r) => r.statusRows[s.key] || []),
    })),
  };

  const options = {
    indexAxis: "y",
    maintainAspectRatio: false,
    onHover: cursorPointerOnHover,
    onClick: (event, elements) => {
      if (!elements.length || !onSelect) return;
      const { datasetIndex, index } = elements[0];
      const status = STATUS_DATASETS[datasetIndex];
      onSelect(data.datasets[datasetIndex]._rows[index], `${rows[index].project} — ${status.label}`);
    },
    plugins: {
      legend: {
        position: "top",
        align: "end",
        labels: { color: "#cfd6e6", boxWidth: 11, boxHeight: 11, usePointStyle: true, pointStyle: "rectRounded", font: { size: 12 } },
      },
      tooltip: {
        filter: (i) => i.raw > 0,
        callbacks: {
          label: (c) => ` ${c.dataset.label}: ${usd(c.raw)}`,
          footer: (items) => "Total: " + usd(items.reduce((a, b) => a + b.raw, 0)),
        },
      },
    },
    scales: {
      x: { stacked: true, grid: { color: GRID_COLOR }, border: { display: false }, ticks: { ...TICK, callback: (v) => usdK(v) } },
      y: { stacked: true, grid: { display: false }, border: { display: false }, ticks: { font: { size: 11 } } },
    },
  };

  return (
    <div className="panel">
      <div className="p-head">
        <div className="p-title">Invoices by Status per Project</div>
        <div className="p-note">billed amount · click a segment for detail</div>
      </div>
      <div className="cbox tall">{loading ? <SkeletonHBars count={rows.length || 8} /> : <Bar data={data} options={options} />}</div>
    </div>
  );
}
