"use client";

import { Bar } from "react-chartjs-2";
import { GRID_COLOR } from "@/lib/chartSetup";
import { MONTH_ABBR } from "@/lib/dates";
import { SkeletonBars } from "../Skeleton";

export default function ClosedDealsChart({ year, closed, closedAddr, loading = false }) {
  const data = {
    labels: MONTH_ABBR,
    datasets: [{ data: closed, backgroundColor: "#4a90e2", borderRadius: 5, maxBarThickness: 42 }],
  };

  const options = {
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        filter: (i) => i.raw > 0,
        callbacks: {
          label: (c) => ` ${c.raw} deal${c.raw !== 1 ? "s" : ""}`,
          afterLabel: (c) => (closedAddr[c.dataIndex] || []).map((a) => "• " + a),
        },
      },
    },
    scales: {
      y: { beginAtZero: true, grid: { color: GRID_COLOR }, border: { display: false }, ticks: { stepSize: 1, precision: 0 } },
      x: { grid: { display: false }, border: { display: false }, ticks: { font: { size: 10.5 } } },
    },
  };

  return (
    <div className="panel">
      <div className="p-head">
        <div className="p-title">Closed Deals {year}</div>
        <div className="p-note">won by month</div>
      </div>
      <div className="cbox">{loading ? <SkeletonBars count={12} /> : <Bar data={data} options={options} />}</div>
    </div>
  );
}
