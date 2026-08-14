"use client";

import { Bar } from "react-chartjs-2";
import { GRID_COLOR, TICK, cursorPointerOnHover } from "@/lib/chartSetup";
import { usd, PIPELINE_STAGE_COLORS, PIPELINE_STAGE_ORDER } from "@/lib/format";
import { SkeletonHBars } from "../Skeleton";

const stageRank = (name) => {
  const i = PIPELINE_STAGE_ORDER.indexOf(name);
  return i === -1 ? PIPELINE_STAGE_ORDER.length : i;
};

/* One bar per CRM pipeline stage, in fixed funnel order (New Deal → Client
   Discovery → Create Proposal → Client Proposal Review → Deal Closing →
   Deal Won → Long Term Leads → Deals Lost), not sorted by count. Bar length
   is deal count. Click a bar to see every deal in that stage. */
export default function PipelineStageChart({ stages, loading = false, onSelect }) {
  const sorted = [...stages].sort((a, b) => stageRank(a.stage) - stageRank(b.stage));
  const labels = sorted.map((s) => s.stage);
  const totalCount = sorted.reduce((sum, s) => sum + s.count, 0);
  const totalValue = sorted.reduce((sum, s) => sum + s.value, 0);

  const data = {
    labels,
    datasets: [
      {
        data: sorted.map((s) => s.count),
        backgroundColor: labels.map((l) => PIPELINE_STAGE_COLORS[l] || "#8b95b2"),
        borderRadius: 6,
      },
    ],
  };

  const options = {
    indexAxis: "y",
    maintainAspectRatio: false,
    onHover: cursorPointerOnHover,
    onClick: (event, elements) => {
      if (!elements.length || !onSelect) return;
      const s = sorted[elements[0].index];
      onSelect(s.deals, `${s.stage} — ${s.count} deal${s.count !== 1 ? "s" : ""}`);
    },
    plugins: {
      legend: { display: false },
      tooltip: {
        callbacks: {
          label: (c) => {
            const s = sorted[c.dataIndex];
            return ` ${s.count} deal${s.count !== 1 ? "s" : ""} · ${usd(s.value)}`;
          },
          afterLabel: () => "Click for the full list",
        },
      },
    },
    scales: {
      x: { beginAtZero: true, grid: { color: GRID_COLOR }, border: { display: false }, ticks: { ...TICK, precision: 0 } },
      y: { grid: { display: false }, border: { display: false }, ticks: { font: { size: 11.5 } } },
    },
  };

  return (
    <div className="panel">
      <div className="p-head">
        <div className="p-title">Pipeline by Stage</div>
        <div className="p-note">{loading ? "" : `${totalCount} deals · ${usd(totalValue)} · click a bar for detail`}</div>
      </div>
      <div className="cbox tall">{loading ? <SkeletonHBars count={7} /> : <Bar data={data} options={options} />}</div>
    </div>
  );
}
