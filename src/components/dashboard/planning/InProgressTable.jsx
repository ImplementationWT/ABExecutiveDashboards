import { PERSON_COLORS, STAGE_COLORS, colorFor, initials, shortStage } from "@/lib/format";
import { SkeletonTableRows } from "../Skeleton";

export default function InProgressTable({ rows, loading = false }) {
  return (
    <div className="panel">
      <div className="p-head">
        <div className="p-title">Tasks Currently In Progress</div>
        <div className="p-note">{loading ? "syncing…" : `${rows.length} · owner · start → finish`}</div>
      </div>
      <div style={{ overflowX: "auto" }}>
        <table>
          <thead>
            <tr>
              <th>Task</th>
              <th>Owner</th>
              <th>Project</th>
              <th>Start</th>
              <th>Finish</th>
              <th>Stage</th>
            </tr>
          </thead>
          <tbody>
            {loading && <SkeletonTableRows rows={6} cols={6} />}
            {!loading && rows.length === 0 && (
              <tr>
                <td colSpan={6} style={{ color: "var(--muted)" }}>
                  No tasks for this filter.
                </td>
              </tr>
            )}
            {!loading &&
              rows.map((r, i) => {
              const [task, owner, project, start, finish, stage] = r;
              const avatarColor = PERSON_COLORS[owner] || "#888";
              const stageColor = STAGE_COLORS[stage] || "#8b95b2";
              return (
                <tr key={i}>
                  <td>{task}</td>
                  <td>
                    <span className="owner">
                      <span className="av" style={{ background: avatarColor }}>
                        {initials(owner)}
                      </span>
                      {owner}
                    </span>
                  </td>
                  <td className="proj">{project}</td>
                  <td className="mono">{start}</td>
                  <td className="mono">{finish}</td>
                  <td>
                    <span className="stage" style={{ color: stageColor }}>
                      ●
                    </span>{" "}
                    <span className="stage">{shortStage(stage)}</span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
