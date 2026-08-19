import { Skeleton, SkeletonHBars, SkeletonBars } from "../Skeleton";

/* Shown before the financial board's first snapshot has ever loaded — there's
   no project/status list or month range yet to build the filter bar from.
   Subsequent refreshes use the per-chart skeletons already wired into each
   chart component instead of this full-pane version. */
export default function FinancialPaneSkeleton({ error }) {
  if (error) {
    return (
      <div className="panel" style={{ color: "var(--red)" }}>
        Couldn&apos;t load Financial data: {error}
      </div>
    );
  }

  return (
    <>
      <div className="kpis k4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="kpi">
            <div className="l">&nbsp;</div>
            <div className="v">
              <Skeleton height={28} width="70%" />
            </div>
            <div className="f">&nbsp;</div>
          </div>
        ))}
      </div>

      <div className="sec-title">Financial overview by project</div>
      <div className="panel">
        <div className="cbox tall">
          <SkeletonHBars count={8} />
        </div>
      </div>

      <div className="sec-title">Accounts receivable</div>
      <div className="panel">
        <div className="cbox">
          <SkeletonBars count={4} />
        </div>
      </div>

      <div className="grid g2" style={{ marginTop: 16 }}>
        <div className="panel">
          <div className="cbox">
            <SkeletonBars count={6} />
          </div>
        </div>
        <div className="panel">
          <div className="cbox">
            <SkeletonBars count={6} />
          </div>
        </div>
      </div>
    </>
  );
}