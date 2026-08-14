"use client";

import { Bar } from "react-chartjs-2";
import { GRID_COLOR, TICK } from "@/lib/chartSetup";
import { PERSON_COLORS } from "@/lib/format";
import { SkeletonBars } from "../Skeleton";

export default function WeeklyWorkloadChart({ title, rangeLabel, days, records, loading = false }) {
  const owners = [...new Set(records.map((r) => r.owner))];
  const byOwner = {};
  owners.forEach((o) => (byOwner[o] = { counts: [0, 0, 0, 0, 0], tasks: [[], [], [], [], []] }));
  records.forEach((r) => {
    byOwner[r.owner].counts[r.d]++;
    byOwner[r.owner].tasks[r.d].push(r.task + " — " + r.project);
  });

  const data = {
    labels: days,
    datasets: owners.map((o) => ({
      label: o,
      data: byOwner[o].counts,
      backgroundColor: PERSON_COLORS[o],
      borderRadius: 3,
      stack: "s",
      _tasks: byOwner[o].tasks,
    })),
  };

  const options = {
    maintainAspectRatio: false,
    interaction: { mode: "nearest", intersect: true },
    plugins: {
      legend: {
        position: "bottom",
        labels: { color: "#cfd6e6", boxWidth: 9, boxHeight: 9, usePointStyle: true, pointStyle: "circle", font: { size: 10.5 }, padding: 9 },
      },
      tooltip: {
        filter: (i) => i.raw > 0,
        callbacks: {
          title: (i) => (i.length ? i[0].label : ""),
          label: (c) => `${c.dataset.label} · ${c.raw} task${c.raw > 1 ? "s" : ""}`,
          afterLabel: (c) => (c.dataset._tasks[c.dataIndex] || []).map((x) => "• " + x),
        },
      },
    },
    scales: {
      x: { stacked: true, grid: { display: false }, border: { display: false }, ticks: TICK },
      y: { stacked: true, beginAtZero: true, grid: { color: GRID_COLOR }, border: { display: false }, ticks: { stepSize: 2, ...TICK } },
    },
  };

  return (
    <div className="panel">
      <div className="p-head">
        <div className="p-title">{title}</div>
        <div className="p-note">
          {rangeLabel} · {records.length}
        </div>
      </div>
      <div className="cbox">{loading ? <SkeletonBars count={days.length} /> : <Bar data={data} options={options} />}</div>
    </div>
  );
}
