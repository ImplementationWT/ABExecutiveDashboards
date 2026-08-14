"use client";

import { formatSyncTimestamp } from "@/lib/dates";

export default function Header({ isSyncing, hasError, lastSyncedAt, onRefresh }) {
  return (
    <header className="top">
      <div className="brand">
        <span className="k">Arzuman Brothers</span>
        <h1>Executive Dashboard</h1>
      </div>
      <div style={{ textAlign: "right" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 14, justifyContent: "flex-end" }}>
          <span className="live">
            <span className="dot" />
            LIVE · monday.com
          </span>
          <button type="button" className="sync-btn" disabled={isSyncing} onClick={onRefresh}>
            {isSyncing ? <span className="spinner" /> : null}
            {isSyncing ? "Refreshing…" : "Refresh"}
          </button>
        </div>
        <div className={`sync-status${hasError ? " warn" : ""}`}>
          {hasError
            ? `Some boards failed to refresh · last updated ${formatSyncTimestamp(lastSyncedAt)}`
            : `Last updated: ${formatSyncTimestamp(lastSyncedAt)}`}
        </div>
      </div>
    </header>
  );
}
