"use client";

import { useMemo } from "react";
import { useMultiSelect } from "../filters/useMultiSelect";
import MultiSelectDropdown from "../filters/MultiSelectDropdown";
import CompletionChart from "./CompletionChart";
import VarianceChart from "./VarianceChart";
import OverdueByPersonChart from "./OverdueByPersonChart";
import OverdueByProjectChart from "./OverdueByProjectChart";
import WeeklyWorkloadChart from "./WeeklyWorkloadChart";
import InProgressTable from "./InProgressTable";
import GanttChart from "./GanttChart";
import PlanningPaneSkeleton from "./PlanningPaneSkeleton";

const dayRangeLabel = (days) => (days.length ? `${days[0]}–${days[days.length - 1]}` : "");

/* `data` is the planning_snapshot document from /api/data/planning (see
   docs/mongo-schema.md). Before it has loaded once, there's no PROJECTS/
   OWNERS list yet to build the filters from, so we show a full-pane
   skeleton instead — see PlanningPaneSkeleton. */
export default function PlanningPane({ data, loading = false, error = null }) {
  if (!data) {
    return <PlanningPaneSkeleton error={error} />;
  }
  return <PlanningPaneContent data={data} loading={loading} />;
}

function PlanningPaneContent({ data, loading }) {
  const { projects: PROJECTS, owners: OWNERS, overdue: OVERDUE, inProgress: IN_PROGRESS, completion: COMPLETION, variance: VARIANCE, gantt: GANTT, ganttGroups: GANTT_GROUPS } = data;
  const { days: TASKS_DUE_THIS_WEEK_DAYS, records: TASKS_DUE_THIS_WEEK } = data.tasksDueThisWeek;
  const { days: TASKS_DUE_NEXT_WEEK_DAYS, records: TASKS_DUE_NEXT_WEEK } = data.tasksDueNextWeek;

  const projectFilter = useMultiSelect(PROJECTS, "All projects");
  const ownerFilter = useMultiSelect(OWNERS, "All owners");
  const statusOptions = useMemo(() => GANTT_GROUPS.map((g) => g.name), [GANTT_GROUPS]);
  const statusFilter = useMultiSelect(statusOptions, "All statuses");

  function resetFilters() {
    projectFilter.reset();
    ownerFilter.reset();
    statusFilter.reset();
  }

  /* Project "status" is the phase/group it's in on the Gantt — there's no
     separate status field yet, so this reuses that classification. Projects
     with no Gantt row are unclassified and only show up while every status
     is selected (can't otherwise say which bucket they'd belong to). */
  const projectGroup = useMemo(() => {
    const map = {};
    GANTT.forEach((g) => (map[g.project] = g.group));
    return map;
  }, [GANTT]);

  const projects = useMemo(() => {
    const allStatuses = statusFilter.selected.size === statusOptions.length;
    return new Set(
      [...projectFilter.selected].filter((p) => {
        const group = projectGroup[p];
        return group ? statusFilter.selected.has(group) : allStatuses;
      })
    );
  }, [projectFilter.selected, statusFilter.selected, statusOptions.length, projectGroup]);
  const owners = ownerFilter.selected;

  const completionRows = useMemo(() => COMPLETION.filter((r) => projects.has(r.project)), [COMPLETION, projects]);
  const varianceRows = useMemo(() => VARIANCE.filter((r) => projects.has(r.project)), [VARIANCE, projects]);
  const overdueRows = useMemo(
    () => OVERDUE.filter((r) => projects.has(r.project) && owners.has(r.owner)),
    [OVERDUE, projects, owners]
  );
  const thisWeekRows = useMemo(
    () => TASKS_DUE_THIS_WEEK.filter((r) => projects.has(r.project) && owners.has(r.owner)),
    [TASKS_DUE_THIS_WEEK, projects, owners]
  );
  const nextWeekRows = useMemo(
    () => TASKS_DUE_NEXT_WEEK.filter((r) => projects.has(r.project) && owners.has(r.owner)),
    [TASKS_DUE_NEXT_WEEK, projects, owners]
  );
  const inProgressRows = useMemo(
    () => IN_PROGRESS.filter((r) => projects.has(r[2]) && owners.has(r[1])),
    [IN_PROGRESS, projects, owners]
  );
  const ganttRows = useMemo(() => GANTT.filter((r) => projects.has(r.project)), [GANTT, projects]);

  return (
    <>
      <div className="filterbar">
        <MultiSelectDropdown
          label="Projects"
          items={PROJECTS}
          selected={projectFilter.selected}
          summary={projectFilter.label}
          onToggleAll={projectFilter.toggleAll}
          onToggleOne={projectFilter.toggleOne}
        />
        <MultiSelectDropdown
          label="Owner"
          items={OWNERS}
          selected={ownerFilter.selected}
          summary={ownerFilter.label}
          onToggleAll={ownerFilter.toggleAll}
          onToggleOne={ownerFilter.toggleOne}
        />
        <MultiSelectDropdown
          label="Status"
          items={statusOptions}
          selected={statusFilter.selected}
          summary={statusFilter.label}
          onToggleAll={statusFilter.toggleAll}
          onToggleOne={statusFilter.toggleOne}
        />
        <button type="button" className="reset" onClick={resetFilters}>
          Reset filters
        </button>
      </div>

      <div className="sec-title">Project completion &amp; schedule variance</div>
      <div className="grid g2">
        <CompletionChart rows={completionRows} loading={loading} />
        <VarianceChart rows={varianceRows} loading={loading} />
      </div>

      <div className="sec-title">Overdue tasks across all projects</div>
      <div className="grid g2">
        <OverdueByPersonChart records={overdueRows} loading={loading} />
        <OverdueByProjectChart records={overdueRows} loading={loading} />
      </div>

      <div className="sec-title">Upcoming workload by day &amp; owner</div>
      <div className="grid g2">
        <WeeklyWorkloadChart title="Tasks Due This Week" rangeLabel={dayRangeLabel(TASKS_DUE_THIS_WEEK_DAYS)} days={TASKS_DUE_THIS_WEEK_DAYS} records={thisWeekRows} loading={loading} />
        <WeeklyWorkloadChart title="Tasks Due Next Week" rangeLabel={dayRangeLabel(TASKS_DUE_NEXT_WEEK_DAYS)} days={TASKS_DUE_NEXT_WEEK_DAYS} records={nextWeekRows} loading={loading} />
      </div>

      <div className="sec-title">Tasks currently in progress</div>
      <InProgressTable rows={inProgressRows} loading={loading} />

      <div className="sec-title">Project Timelines</div>
      <GanttChart rows={ganttRows} groups={GANTT_GROUPS} loading={loading} />
    </>
  );
}
