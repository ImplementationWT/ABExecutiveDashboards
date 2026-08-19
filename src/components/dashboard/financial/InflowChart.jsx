"use client";

import { Bar } from "react-chartjs-2";
import { GRID_COLOR, TICK, cursorPointerOnHover } from "@/lib/chartSetup";
import { usdK } from "@/lib/format";
import { monthLabel } from "@/lib/dates";
import { SkeletonBars } from "../Skeleton";

export default function InflowChart({ months, inflow, loading = false, onSelect }) {
  const data = {
    labels: months.map(monthLabel),
    datasets: [
      {
        data: months.map((m) => inflow[m]?.total || 0),
        backgroundColor: "#f0a92b",
        borderRadius: 5,
        _rows: months.map((m) => inflow[m]?.rows || []),
      },
    ],
  };

  const options = {
    maintainAspectRatio: false,
    onHover: cursorPointerOnHover,
    onClick: (event, elements) => {
      if (!elements.length || !onSelect) return;
      const { index } = elements[0];
      onSelect(data.datasets[0]._rows[index], `Expected Inflow — ${monthLabel(months[index])}`);
    },
    plugins: {
      legend: { display: false },
      tooltip: { enabled: false },
    },
    scales: {
      y: { beginAtZero: true, grid: { color: GRID_COLOR }, border: { display: false }, ticks: { ...TICK, callback: (v) => usdK(v) } },
      x: { grid: { display: false }, border: { display: false }, ticks: TICK },
    },
  };

  return (
    <div className="panel">
      <div className="p-head">
        <div className="p-title">Expected Cash Inflow by Month</div>
        <div className="p-note">upcoming milestones · click a bar for detail</div>
      </div>
      <div className="cbox">{loading ? <SkeletonBars count={months.length || 6} /> : <Bar data={data} options={options} />}</div>
      <div className="note">Expected dates derived from each upcoming invoice&apos;s linked milestone finish date.</div>
    </div>
  );
}