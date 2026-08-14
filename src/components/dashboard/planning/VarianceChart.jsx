"use client";

import { Bar } from "react-chartjs-2";
import { GRID_COLOR } from "@/lib/chartSetup";
import { SkeletonHBars } from "../Skeleton";

export default function VarianceChart({ rows, loading = false }) {
  const behind = rows.filter((v) => v.days < 0).length;
  const ahead = rows.filter((v) => v.days > 0).length;

  const data = {
    labels: rows.map((v) => v.project),
    datasets: [
      {
        data: rows.map((v) => v.days),
        backgroundColor: rows.map((v) => (v.days < 0 ? "#ef4d63" : "#2bd49b")),
        borderRadius: 4,
      },
    ],
  };

  const options = {
    indexAxis: "y",
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: { callbacks: { label: (c) => ` ${c.raw > 0 ? "+" : ""}${c.raw} working days` } },
    },
    scales: {
      x: { grid: { color: GRID_COLOR }, border: { display: false } },
      y: { grid: { display: false }, border: { display: false }, ticks: { font: { size: 11.5 } } },
    },
  };

  return (
    <div className="panel">
      <div className="p-head">
        <div className="p-title">Schedule Variance</div>
        <div className="p-note">
          {behind} behind · {ahead} ahead
        </div>
      </div>
      <div className="cbox tall">{loading ? <SkeletonHBars count={rows.length || 8} /> : <Bar data={data} options={options} />}</div>
      <div className="note">
        Working-day gap between each project&apos;s estimated finish and current projected end. Negative = behind.
      </div>
    </div>
  );
}
