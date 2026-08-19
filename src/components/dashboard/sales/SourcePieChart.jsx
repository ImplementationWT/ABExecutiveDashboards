"use client";

import { Pie } from "react-chartjs-2";
import { SOURCE_COLORS, colorFor } from "@/lib/format";
import { SkeletonDonut } from "../Skeleton";

export default function SourcePieChart({ title, topNote, bottomNote, rows, addr, loading = false }) {
  const total = rows.reduce((a, r) => a + r[1], 0);

  const data = {
    labels: rows.map((r) => r[0]),
    datasets: [
      {
        data: rows.map((r) => r[1]),
        backgroundColor: rows.map((r) => colorFor(r[0], SOURCE_COLORS)),
        borderColor: "#1b2236",
        borderWidth: 2,
      },
    ],
  };

  const options = {
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "right",
        labels: {
          color: "#cfd6e6",
          boxWidth: 10,
          boxHeight: 10,
          usePointStyle: true,
          pointStyle: "circle",
          font: { family: "Inter, sans-serif", size: 11 },
          padding: 8,
          generateLabels: (chart) =>
            chart.data.labels.map((l, i) => {
              const v = chart.data.datasets[0].data[i];
              return {
                text: `${l}: ${((v / total) * 100).toFixed(1)}%`,
                fillStyle: chart.data.datasets[0].backgroundColor[i],
                strokeStyle: "#1b2236",
                fontColor: "#cfd6e6",
                pointStyle: "circle",
                index: i,
              };
            }),
        },
      },
      tooltip: {
        callbacks: {
          label: (c) => ` ${c.label}: ${c.raw} (${((c.raw / total) * 100).toFixed(1)}%)`,
          afterLabel: (c) => ((addr && addr[c.label]) || []).slice(0, 12).map((a) => "• " + a),
        },
      },
    },
  };

  return (
    <div className="panel">
      <div className="p-head">
        <div className="p-title">{title}</div>
        <div className="p-note">{topNote}</div>
      </div>
      <div className="cbox pie">{loading ? <SkeletonDonut legendCount={rows.length || 6} /> : <Pie data={data} options={options} />}</div>
      {bottomNote && <div className="note">{bottomNote}</div>}
    </div>
  );
}
