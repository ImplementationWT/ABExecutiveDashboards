"use client";

import { Doughnut } from "react-chartjs-2";
import { PERSON_COLORS } from "@/lib/format";
import { SkeletonDonut } from "../Skeleton";

export default function OverdueByPersonChart({ records, loading = false }) {
  const byOwner = {};
  records.forEach((r) => (byOwner[r.owner] = byOwner[r.owner] || []).push(r));
  const owners = Object.keys(byOwner);

  const data = {
    labels: owners,
    datasets: [
      {
        data: owners.map((o) => byOwner[o].length),
        backgroundColor: owners.map((o) => PERSON_COLORS[o]),
        borderColor: "#1b2236",
        borderWidth: 3,
        hoverOffset: 6,
      },
    ],
  };

  const options = {
    maintainAspectRatio: false,
    cutout: "58%",
    plugins: {
      legend: {
        position: "right",
        labels: { color: "#cfd6e6", boxWidth: 10, boxHeight: 10, usePointStyle: true, pointStyle: "circle", font: { size: 11.5 } },
      },
      tooltip: {
        callbacks: {
          label: (c) => ` ${c.label}: ${c.raw}`,
          afterLabel: (c) => byOwner[c.label].map((r) => "• " + r.task + " — " + r.project),
        },
      },
    },
  };

  return (
    <div className="panel">
      <div className="p-head">
        <div className="p-title">By Assigned Person</div>
        <div className="p-note">{records.length} overdue</div>
      </div>
      <div className="cbox sm">{loading ? <SkeletonDonut /> : <Doughnut data={data} options={options} />}</div>
    </div>
  );
}
