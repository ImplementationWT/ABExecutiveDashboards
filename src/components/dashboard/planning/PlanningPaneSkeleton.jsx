import { SkeletonHBars, SkeletonDonut, SkeletonBars, SkeletonGantt } from "../Skeleton";

/* Shown before the planning board's first snapshot has ever loaded — there's
   no PROJECTS/OWNERS list yet, so the filter bar can't mount. Once data
   arrives once, PlanningPane switches to the real filterable content and
   never shows this again (subsequent refreshes use the per-chart skeletons
   wired into each chart component instead). */
export default function PlanningPaneSkeleton({ error }) {
  if (error) {
    return (
      <div className="panel" style={{ color: "var(--red)" }}>
        Couldn&apos;t load Planning &amp; Design data: {error}
      </div>
    );
  }

  return (
    <>
      <div className="sec-title">Project completion &amp; schedule variance</div>
      <div className="grid g2">
        <div className="panel">
          <div className="cbox tall">
            <SkeletonHBars count={8} />
          </div>
        </div>
        <div className="panel">
          <div className="cbox tall">
            <SkeletonHBars count={8} />
          </div>
        </div>
      </div>

      <div className="sec-title">Overdue tasks across all projects</div>
      <div className="grid g2">
        <div className="panel">
          <div className="cbox sm">
            <SkeletonDonut />
          </div>
        </div>
        <div className="panel">
          <div className="cbox sm">
            <SkeletonBars count={5} />
          </div>
        </div>
      </div>

      <div className="sec-title">Upcoming workload by day &amp; owner</div>
      <div className="grid g2">
        <div className="panel">
          <div className="cbox">
            <SkeletonBars count={5} />
          </div>
        </div>
        <div className="panel">
          <div className="cbox">
            <SkeletonBars count={5} />
          </div>
        </div>
      </div>

      <div className="sec-title">Tasks currently in progress</div>
      <div className="panel">
        <SkeletonGantt rows={5} />
      </div>

      <div className="sec-title">Project Timelines</div>
      <div className="panel">
        <SkeletonGantt rows={6} />
      </div>
    </>
  );
}
