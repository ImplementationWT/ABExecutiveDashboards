"use client";

import { useMemo } from "react";
import { Bar } from "react-chartjs-2";
import { GRID_COLOR, TICK, cursorPointerOnHover } from "@/lib/chartSetup";
import { usd, usdK, statusMetaFor, orderStatuses } from "@/lib/format";
import { SkeletonHBars } from "../Skeleton";

export default function ProjectInvoicesChart({ rows, loading = false, onSelect }) {
  /* Bar segments are whatever statuses actually appear across the filtered
     rows — not a fixed list — so a status with real $ always renders, and
     one nobody has anymore just stops showing up on its own. */
  const statusDatasets = useMemo(() => {
    const statuses = orderStatuses(rows.flatMap((r) => Object.keys(r.byStatus)));
    return statuses.map((key) => ({ key, ...statusMetaFor(key) }));
  }, [rows]);

  const data = {
    labels: rows.map((r) => r.project),
    datasets: statusDatasets.map((s) => ({
      label: s.label,
      data: rows.map((r) => r.byStatus[s.key] || 0),
      backgroundColor: s.color,
      _rows: rows.map((r) => r.statusRows[s.key] || []),
    })),
  };

  const options = {
    indexAxis: "y",
    maintainAspectRatio: false,
    onHover: cursorPointerOnHover,
    onClick: (event, elements) => {
      if (!elements.length || !onSelect) return;
      const { datasetIndex, index } = elements[0];
      const status = statusDatasets[datasetIndex];
      onSelect(data.datasets[datasetIndex]._rows[index], `${rows[index].project} — ${status.label}`);
    },
    plugins: {
      legend: {
        position: "top",
        align: "end",
        labels: { color: "#cfd6e6", boxWidth: 11, boxHeight: 11, usePointStyle: true, pointStyle: "rectRounded", font: { size: 12 } },
      },
      tooltip: {
        filter: (i) => i.raw > 0,
        callbacks: {
          label: (c) => ` ${c.dataset.label}: ${usd(c.raw)}`,
          footer: (items) => "Total: " + usd(items.reduce((a, b) => a + b.raw, 0)),
        },
      },
    },
    scales: {
      x: { stacked: true, grid: { color: GRID_COLOR }, border: { display: false }, ticks: { ...TICK, callback: (v) => usdK(v) } },
      y: { stacked: true, grid: { display: false }, border: { display: false }, ticks: { font: { size: 11 } } },
    },
  };

  return (
    <div className="panel">
      <div className="p-head">
        <div className="p-title">Invoices by Status per Project</div>
        <div className="p-note">billed amount · click a segment for detail</div>
      </div>
      <div className="cbox tall">{loading ? <SkeletonHBars count={rows.length || 8} /> : <Bar data={data} options={options} />}</div>
    </div>
  );
}
