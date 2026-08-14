import { Skeleton, SkeletonBars, SkeletonDonut, SkeletonHBars } from "../Skeleton";

/* Shown before the sales board's first snapshot has ever loaded — there's no
   year list yet to build the year selector from. Subsequent refreshes use
   the per-chart skeletons already wired into each chart component instead
   of this full-pane version. */
export default function SalesPaneSkeleton({ error }) {
  if (error) {
    return (
      <div className="panel" style={{ color: "var(--red)" }}>
        Couldn&apos;t load Sales data: {error}
      </div>
    );
  }

  return (
    <>
      <div className="grid main">
        <div className="panel">
          <div className="cbox">
            <SkeletonBars count={12} />
          </div>
        </div>
        <div className="col">
          <div className="panel valuecard">
            <Skeleton height={40} width="65%" style={{ margin: "0 auto" }} />
          </div>
          <div className="trio">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="stat">
                <Skeleton height={25} width="60%" style={{ margin: "6px auto 0" }} />
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="grid main" style={{ marginTop: 16 }}>
        <div className="panel">
          <div className="cbox pie">
            <SkeletonDonut />
          </div>
        </div>
        <div className="panel">
          <div className="cbox pie">
            <SkeletonDonut />
          </div>
        </div>
      </div>

      <div className="sec-title">Pipeline</div>
      <div className="panel">
        <div className="cbox tall">
          <SkeletonHBars count={7} />
        </div>
      </div>
    </>
  );
}
