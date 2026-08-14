"use client";

import { useMemo, useState } from "react";
import { fmtD, fmtDY, toUTCDate, workingDays } from "@/lib/dates";
import { SkeletonGantt } from "../Skeleton";

const QUARTER_WIDTH = 84;
const LABEL_WIDTH = 250;

const quarterOf = (date) => Math.floor(date.getUTCMonth() / 3) + 1;
const quarterStart = (y, q) => new Date(Date.UTC(y, (q - 1) * 3, 1));

/* Auto-fits the axis to the filtered projects' dates (incl. baseline), padded by one quarter each side. */
function buildLayout(rows, ganttGroups) {
  if (!rows.length) return null;

  let minT = Infinity;
  let maxT = -Infinity;
  rows.forEach((r) =>
    [r.start, r.finish, r.baseline].forEach((d) => {
      const t = toUTCDate(d).getTime();
      if (t < minT) minT = t;
      if (t > maxT) maxT = t;
    })
  );
  const dMin = new Date(minT);
  const dMax = new Date(maxT);

  let sy = dMin.getUTCFullYear();
  let sq = quarterOf(dMin);
  let ey = dMax.getUTCFullYear();
  let eq = quarterOf(dMax);
  if (--sq < 1) {
    sq = 4;
    sy--;
  }
  if (++eq > 4) {
    eq = 1;
    ey++;
  }

  const quarters = [];
  let cy = sy;
  let cq = sq;
  while (cy < ey || (cy === ey && cq <= eq)) {
    quarters.push({
      y: cy,
      q: cq,
      start: quarterStart(cy, cq),
      end: quarterStart(cq === 4 ? cy + 1 : cy, cq === 4 ? 1 : cq + 1),
    });
    if (++cq > 4) {
      cq = 1;
      cy++;
    }
  }

  const axStart = quarters[0].start;
  const axEnd = quarters[quarters.length - 1].end;
  const timelineWidth = quarters.length * QUARTER_WIDTH;

  const xPos = (dateLike) => {
    const t = dateLike instanceof Date ? dateLike : toUTCDate(dateLike);
    for (let i = 0; i < quarters.length; i++) {
      const q = quarters[i];
      if (t >= q.start && t < q.end) return (i + (t - q.start) / (q.end - q.start)) * QUARTER_WIDTH;
    }
    return t < axStart ? 0 : timelineWidth;
  };

  const years = {};
  quarters.forEach((q) => (years[q.y] = (years[q.y] || 0) + 1));

  const now = new Date();
  const nowX = xPos(now);
  const showToday = now >= axStart && now < axEnd;

  const groups = ganttGroups.map((gr) => {
    const items = rows.filter((r) => r.group === gr.name);
    if (!items.length) return null;
    const gmin = items.reduce((a, r) => (r.start < a ? r.start : a), items[0].start);
    const gmax = items.reduce((a, r) => (r.finish > a ? r.finish : a), items[0].finish);
    const gx = xPos(gmin);
    const gw = Math.max(2, xPos(gmax) - gx);
    return {
      ...gr,
      gmin,
      gmax,
      gx,
      gw,
      items: items.map((r) => {
        const ax = xPos(r.start);
        const aEnd = xPos(r.finish);
        const aw = Math.max(3, aEnd - ax);
        const blEnd = xPos(r.baseline);
        const blw = Math.max(3, blEnd - ax);
        const vLeft = Math.max(aEnd, blEnd) + 7;
        return { ...r, ax, aw, blEnd, blw, vLeft };
      }),
    };
  }).filter(Boolean);

  return { quarters, years, timelineWidth, nowX, showToday, groups };
}

export default function GanttChart({ rows, groups: ganttGroups, loading = false }) {
  const [showBaseline, setShowBaseline] = useState(true);
  const layout = useMemo(() => buildLayout(rows, ganttGroups), [rows, ganttGroups]);
  const now = new Date();

  return (
    <div className="panel">
      <div className="p-head">
        <div className="p-title">Project Timelines</div>
        <div className="p-note" />
      </div>
      <div className="gantt-bar-toggle">
        <span
          className={`gtoggle${showBaseline ? " on" : ""}`}
          role="switch"
          aria-checked={showBaseline}
          tabIndex={0}
          onClick={() => setShowBaseline((s) => !s)}
          onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && setShowBaseline((s) => !s)}
        >
          <span className="sw" /> Baseline
        </span>
      </div>

      <div className="gantt">
        {loading ? (
          <SkeletonGantt rows={rows.length || 6} />
        ) : !layout ? (
          <div style={{ padding: 18, color: "var(--muted)" }}>No projects match this filter.</div>
        ) : (
          <div className="gantt-scroll">
            <div className="gantt-inner" style={{ width: LABEL_WIDTH + layout.timelineWidth }}>
              <div className="g-head">
                <div className="g-left" style={{ height: 46 }} />
                <div className="g-track-head" style={{ width: layout.timelineWidth }}>
                  <div className="g-years">
                    {Object.entries(layout.years).map(([y, count]) => (
                      <div key={y} className="g-year" style={{ width: count * QUARTER_WIDTH }}>
                        {y}
                      </div>
                    ))}
                  </div>
                  <div className="g-quarters">
                    {layout.quarters.map((q, i) => (
                      <div key={i} className={`g-q${now >= q.start && now < q.end ? " qnow" : ""}`}>
                        Q{q.q}
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="g-body">
                <div className="g-grid" style={{ left: LABEL_WIDTH, width: layout.timelineWidth }}>
                  {layout.quarters.map((q, i) => (
                    <div key={i} className="g-gl" style={{ left: i * QUARTER_WIDTH }} />
                  ))}
                  {layout.showToday && <div className="g-today" style={{ left: layout.nowX }} />}
                </div>

                {layout.groups.map((gr) => (
                  <div key={gr.name}>
                    <div className="g-grouphead">
                      <div className="g-left">
                        <span className="g-gdot" style={{ background: gr.color }} />
                        {gr.name}
                      </div>
                      <div className="g-gtrack">
                        <div className="g-gsummary" style={{ left: gr.gx, width: gr.gw, background: gr.color }} />
                        <div className="g-gsummary-lbl" style={{ left: gr.gx + gr.gw + 8 }}>
                          {fmtDY(gr.gmin)} – {fmtDY(gr.gmax)} · {workingDays(gr.gmin, gr.gmax)} days
                        </div>
                      </div>
                    </div>

                    {gr.items.map((item) => (
                      <div key={item.project} className="g-row">
                        <div className="g-left">
                          <span className="g-pname">{item.project}</span>
                          <span className="g-prange">
                            {fmtD(item.start)} – {fmtD(item.finish)}
                          </span>
                        </div>
                        <div className="g-track">
                          <div
                            className="g-bar"
                            title={`Actual: ${fmtDY(item.start)} – ${fmtDY(item.finish)} · baseline ${fmtDY(
                              item.baseline
                            )} · variance ${item.variance > 0 ? "+" : ""}${item.variance} working days`}
                            style={{ left: item.ax, width: item.aw, background: gr.color }}
                          />
                          {showBaseline && (
                            <>
                              <div
                                className="g-baseline-bar"
                                title={`Baseline (planned): ${fmtDY(item.start)} – ${fmtDY(item.baseline)}`}
                                style={{ left: item.ax, width: item.blw }}
                              />
                              <div className="g-blcap" style={{ left: item.blEnd - 1 }} />
                            </>
                          )}
                          <div
                            className="g-var"
                            style={{ left: item.vLeft, color: item.variance < 0 ? "#ef4d63" : "#2bd49b" }}
                          >
                            {item.variance > 0 ? "+" : ""}
                            {item.variance}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="g-legend">
        {!loading &&
          layout &&
          layout.groups.map((gr) => (
            <span key={gr.name}>
              <span className="swatch" style={{ background: gr.color }} />
              {gr.name} (actual)
            </span>
          ))}
        <span>
          <span
            className="swatch"
            style={{
              border: "1px solid rgba(233,237,246,.6)",
              background:
                "repeating-linear-gradient(45deg,rgba(233,237,246,.6),rgba(233,237,246,.6) 2px,transparent 2px,transparent 4px)",
            }}
          />
          Baseline (planned)
        </span>
        <span style={{ color: "var(--green)" }}>▍ahead</span>
        <span style={{ color: "var(--red)" }}>▍behind</span>
      </div>
    </div>
  );
}
