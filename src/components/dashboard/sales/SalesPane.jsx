"use client";

import { useMemo, useState } from "react";
import ClosedDealsChart from "./ClosedDealsChart";
import ValueSummary from "./ValueSummary";
import PendingDealCard from "./PendingDealCard";
import SourcePieChart from "./SourcePieChart";
import PipelineStageChart from "./PipelineStageChart";
import DealDetailModal from "./DealDetailModal";
import SalesPaneSkeleton from "./SalesPaneSkeleton";

/* `data` is the sales_snapshot document from /api/data/sales (see
   docs/mongo-schema.md). Before it has loaded once, there's no year list yet
   to build the year selector from, so we show a full-pane skeleton instead —
   see SalesPaneSkeleton. */
export default function SalesPane({ data, loading = false, error = null }) {
  if (!data) {
    return <SalesPaneSkeleton error={error} />;
  }
  return <SalesPaneContent data={data} loading={loading} />;
}

function SalesPaneContent({ data, loading }) {
  const years = useMemo(() => Object.keys(data.byYear).sort().reverse(), [data.byYear]);
  const [year, setYear] = useState(years[0]);
  const [selection, setSelection] = useState(null);
  const d = data.byYear[year];

  const newDealNote = `${d.newTotal} new deals recorded in ${year}`;

  return (
    <>
      <div className="filterbar" style={{ justifyContent: "flex-start" }}>
        <div className="yearsel">
          <label htmlFor="b2_year">Year</label>
          <select id="b2_year" value={year} onChange={(e) => setYear(e.target.value)}>
            {years.map((y) => (
              <option key={y} value={y}>
                {y}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid main">
        <ClosedDealsChart year={year} closed={d.closed} closedAddr={d.closedAddr} loading={loading} />
        <ValueSummary year={year} totalValue={d.totalValue} count={d.count} phase1={d.phase1} phase2={d.phase2} loading={loading} />
      </div>

      {year === years[0] && <PendingDealCard pending={data.pending} loading={loading} />}

      <div className="grid main" style={{ marginTop: 16 }}>
        <SourcePieChart
          title={`New Deal Source ${year}`}
          topNote="by lead source"
          bottomNote={newDealNote}
          rows={d.newSource}
          addr={d.newSourceAddr}
          loading={loading}
        />
        <SourcePieChart title={`Closed Deal Source ${year}`} topNote="won by lead source" rows={d.closedSource} addr={d.closedSourceAddr} loading={loading} />
      </div>

      <div className="sec-title">Pipeline</div>
      <PipelineStageChart stages={data.byStage || []} loading={loading} onSelect={(deals, title) => setSelection({ deals, title })} />

      <DealDetailModal selection={selection} onClose={() => setSelection(null)} />
    </>
  );
}
