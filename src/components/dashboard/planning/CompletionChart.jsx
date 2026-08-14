"use client";

import { Bar } from "react-chartjs-2";
import { GRID_COLOR, TICK } from "@/lib/chartSetup";
import { SkeletonHBars } from "../Skeleton";

const STATUS_DATASETS = [
  { key: "d", label: "Completed", color: "#2bd49b" },
  { key: "s", label: "Scheduled", color: "#4a90e2" },
  { key: "p", label: "In Progress", color: "#f0a92b" },
  { key: "u", label: "Past Due", color: "#ef4d63" },
];

export default function CompletionChart({ rows, loading = false }) {
  const data = {
    labels: rows.map((r) => r.project),
    datasets: STATUS_DATASETS.map((s) => ({
      label: s.label,
      data: rows.map((r) => r[s.key]),
      backgroundColor: s.color,
    })),
  };

  const options = {
    indexAxis: "y",
    maintainAspectRatio: false,
    interaction: { mode: "index", intersect: false },
    plugins: {
      legend: {
        position: "top",
        align: "end",
        labels: { color: "#cfd6e6", boxWidth: 11, boxHeight: 11, usePointStyle: true, pointStyle: "rectRounded", font: { size: 12 } },
      },
      tooltip: {
        callbacks: {
          label: (c) => ` ${c.dataset.label}: ${c.raw}`,
          footer: (items) => {
            const row = rows[items[0].dataIndex];
            const total = row.d + row.s + row.p + row.u;
            return `Total ${total} tasks · ${total ? Math.round((row.d / total) * 100) : 0}% complete`;
          },
        },
      },
    },
    scales: {
      x: { stacked: true, grid: { color: GRID_COLOR }, border: { display: false }, ticks: TICK },
      y: { stacked: true, grid: { display: false }, border: { display: false }, ticks: { font: { size: 11.5 } } },
    },
  };

  return (
    <div className="panel">
      <div className="p-head">
        <div className="p-title">Completion by Status</div>
        <div className="p-note">hover for % complete</div>
      </div>
      <div className="cbox tall">{loading ? <SkeletonHBars count={rows.length || 8} /> : <Bar data={data} options={options} />}</div>
    </div>
  );
}
