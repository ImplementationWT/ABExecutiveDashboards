"use client";

import { Bar } from "react-chartjs-2";
import { GRID_COLOR, TICK, cursorPointerOnHover } from "@/lib/chartSetup";
import { usdK } from "@/lib/format";
import { monthLabel } from "@/lib/dates";
import { SkeletonBars } from "../Skeleton";

export default function MonthlyBillingChart({ months, billed, paid, loading = false, onSelect }) {
  const data = {
    labels: months.map(monthLabel),
    datasets: [
      { label: "Billed", data: months.map((m) => billed[m]?.total || 0), backgroundColor: "#4a90e2", borderRadius: 5, _rows: months.map((m) => billed[m]?.rows || []) },
      { label: "Received", data: months.map((m) => paid[m]?.total || 0), backgroundColor: "#2bd49b", borderRadius: 5, _rows: months.map((m) => paid[m]?.rows || []) },
    ],
  };

  const options = {
    maintainAspectRatio: false,
    onHover: cursorPointerOnHover,
    onClick: (event, elements) => {
      if (!elements.length || !onSelect) return;
      const { datasetIndex, index } = elements[0];
      const label = data.datasets[datasetIndex].label;
      onSelect(data.datasets[datasetIndex]._rows[index], `${label} — ${monthLabel(months[index])}`);
    },
    plugins: {
      legend: {
        position: "top",
        align: "end",
        labels: { color: "#cfd6e6", boxWidth: 11, boxHeight: 11, usePointStyle: true, pointStyle: "rectRounded", font: { size: 12 } },
      },
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
        <div className="p-title">Monthly Billing vs Payments</div>
        <div className="p-note">collected so far, by invoice month · click a bar for detail</div>
      </div>
      <div className="cbox">{loading ? <SkeletonBars count={months.length || 6} /> : <Bar data={data} options={options} />}</div>
    </div>
  );
}