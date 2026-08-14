"use client";

import { Bar } from "react-chartjs-2";
import { GRID_COLOR, TICK } from "@/lib/chartSetup";
import { SkeletonBars } from "../Skeleton";

export default function OverdueByProjectChart({ records, loading = false }) {
  const byProject = {};
  records.forEach((r) => (byProject[r.project] = byProject[r.project] || []).push(r));
  const projects = Object.keys(byProject);

  const data = {
    labels: projects,
    datasets: [
      {
        data: projects.map((p) => byProject[p].length),
        backgroundColor: "#ef4d63",
        borderRadius: 5,
        barThickness: 30,
      },
    ],
  };

  const options = {
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        callbacks: {
          label: (c) => ` Past Due: ${c.raw}`,
          afterLabel: (c) => byProject[c.label].map((r) => "• " + r.task + " (" + r.days + " days past due)"),
        },
      },
    },
    scales: {
      y: { beginAtZero: true, grid: { color: GRID_COLOR }, border: { display: false }, ticks: { stepSize: 1, precision: 0, ...TICK } },
      x: { grid: { display: false }, border: { display: false }, ticks: { font: { size: 10 } } },
    },
  };

  return (
    <div className="panel">
      <div className="p-head">
        <div className="p-title">By Project &amp; Status</div>
        <div className="p-note">past due</div>
      </div>
      <div className="cbox sm">{loading ? <SkeletonBars count={projects.length || 5} /> : <Bar data={data} options={options} />}</div>
    </div>
  );
}
