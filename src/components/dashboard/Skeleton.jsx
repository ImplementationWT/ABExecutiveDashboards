/* Shimmering placeholders shown in place of a panel's data while its board is syncing.
   Panel chrome (title, notes) stays put — only the data region swaps to these shapes. */

export function Skeleton({ width = "100%", height = 14, radius = 6, style, className = "" }) {
  return <div className={`skel ${className}`.trim()} style={{ width, height, borderRadius: radius, ...style }} />;
}

/* Vertical bars filling a cbox, e.g. weekly workload / closed deals charts. */
export function SkeletonBars({ count = 7 }) {
  return (
    <div className="skel-bars">
      {Array.from({ length: count }).map((_, i) => (
        <Skeleton key={i} height={`${30 + ((i * 37) % 55)}%`} />
      ))}
    </div>
  );
}

/* Horizontal bars, e.g. completion / variance / per-project invoice charts (indexAxis "y"). */
export function SkeletonHBars({ count = 7 }) {
  return (
    <div className="skel-hbars">
      {Array.from({ length: count }).map((_, i) => (
        <Skeleton key={i} height={16} width={`${38 + ((i * 23) % 55)}%`} />
      ))}
    </div>
  );
}

/* Doughnut / pie chart placeholder: a circle plus a legend list. */
export function SkeletonDonut({ legendCount = 5 }) {
  return (
    <div className="skel-donut-wrap">
      <Skeleton radius={999} width={140} height={140} style={{ flex: "0 0 auto" }} />
      <div className="skel-donut-legend">
        {Array.from({ length: legendCount }).map((_, i) => (
          <Skeleton key={i} height={11} width={`${45 + ((i * 13) % 45)}%`} />
        ))}
      </div>
    </div>
  );
}

/* Table body rows. */
export function SkeletonTableRows({ rows = 6, cols = 6 }) {
  return (
    <>
      {Array.from({ length: rows }).map((_, r) => (
        <tr key={r}>
          {Array.from({ length: cols }).map((_, c) => (
            <td key={c}>
              <Skeleton height={11} width={c === 0 ? "85%" : "55%"} />
            </td>
          ))}
        </tr>
      ))}
    </>
  );
}

/* Gantt timeline placeholder: label + bar pairs. */
export function SkeletonGantt({ rows = 6 }) {
  return (
    <div className="skel-gantt">
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="skel-gantt-row">
          <Skeleton height={12} width="80%" style={{ flex: "0 0 180px" }} />
          <Skeleton height={15} radius={4} width={`${28 + ((i * 17) % 55)}%`} />
        </div>
      ))}
    </div>
  );
}