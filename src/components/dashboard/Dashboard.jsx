"use client";

import { useEffect, useRef, useState } from "react";
import "@/lib/chartSetup";
import { syncChartFontFamily } from "@/lib/chartSetup";
import { useDashboardSync } from "@/hooks/useDashboardSync";
import PasswordGate from "./PasswordGate";
import Header from "./Header";
import Tabs from "./Tabs";
import PlanningPane from "./planning/PlanningPane";
import FinancialPane from "./financial/FinancialPane";
import SalesPane from "./sales/SalesPane";

const PANES = [
  { id: "p1", board: "planning", Component: PlanningPane },
  { id: "p3", board: "financial", Component: FinancialPane },
  { id: "p2", board: "sales", Component: SalesPane },
];

export default function Dashboard() {
  const [unlocked, setUnlocked] = useState(false);
  const [activeTab, setActiveTab] = useState("p1");
  const [visited, setVisited] = useState(() => new Set(["p1"]));
  const rootRef = useRef(null);
  const { boards, isSyncing, hasError, oldestSync, refreshAll } = useDashboardSync();

  useEffect(() => {
    if (rootRef.current) syncChartFontFamily(rootRef.current);
  }, []);

  function selectTab(id) {
    setActiveTab(id);
    setVisited((prev) => (prev.has(id) ? prev : new Set(prev).add(id)));
  }

  return (
    <div className="db-root" ref={rootRef}>
      {!unlocked && <PasswordGate onUnlock={() => setUnlocked(true)} />}
      {unlocked && (
        <div className="db-wrap">
          <Header isSyncing={isSyncing} hasError={hasError} lastSyncedAt={oldestSync} onRefresh={refreshAll} />
          <Tabs active={activeTab} onChange={selectTab} />

          {PANES.map(({ id, board, Component }) =>
            visited.has(id) ? (
              <section key={id} className={`pane${activeTab === id ? " active" : ""}`} id={id}>
                <Component
                  data={boards[board].data}
                  loading={boards[board].status === "syncing" || boards[board].status === "loading"}
                  error={boards[board].status === "error" ? boards[board].error : null}
                />
              </section>
            ) : null
          )}
        </div>
      )}
    </div>
  );
}
