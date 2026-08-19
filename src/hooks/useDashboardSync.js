"use client";

import { useCallback, useEffect, useState } from "react";
import { BOARD_KEYS as BOARDS } from "@/lib/boards";
import { fetchBoardData, triggerBoardSync } from "@/lib/boardData";

/* Placeholder shown only until each board's very first fetch resolves. */
const INITIAL_LAST_SYNC = new Date(0).toISOString();

function initialBoards() {
  const boards = {};
  BOARDS.forEach((b) => (boards[b] = { status: "idle", data: null, lastSyncedAt: INITIAL_LAST_SYNC, error: null }));
  return boards;
}

/* Runs `load` (a promise-returning fetch) for one board and writes the
   result back into state. `status` is "loading" only on a board's very
   first fetch (nothing on screen yet) vs. "syncing" once it already has
   data to keep showing while the refresh runs. */
async function applyBoardLoad(board, setBoards, load) {
  setBoards((prev) => ({
    ...prev,
    [board]: { ...prev[board], status: prev[board].data ? "syncing" : "loading", error: null },
  }));

  try {
    const snapshot = await load(board);
    setBoards((prev) => ({
      ...prev,
      [board]: { status: "idle", data: snapshot, lastSyncedAt: snapshot.updatedAt || new Date().toISOString(), error: null },
    }));
  } catch (err) {
    setBoards((prev) => ({ ...prev, [board]: { ...prev[board], status: "error", error: err?.message || "Sync failed" } }));
  }
}

/* Drives the dashboard's data: on mount, each board just reads whatever
   Mongo already has (fast, no N8N involved). The single "Refresh" button
   instead triggers each board's real N8N sync and waits for it — fanned out
   in parallel so a slow board never blocks the others, and each board's
   panel flips back to fresh data the moment its own sync resolves,
   independent of whether the other two are still running. */
export function useDashboardSync() {
  const [boards, setBoards] = useState(initialBoards);

  useEffect(() => {
    BOARDS.forEach((b) => applyBoardLoad(b, setBoards, fetchBoardData));
  }, []);

  const refreshAll = useCallback(() => {
    return Promise.allSettled(BOARDS.map((board) => applyBoardLoad(board, setBoards, triggerBoardSync)));
  }, []);

  const isSyncing = BOARDS.some((b) => boards[b].status === "syncing" || boards[b].status === "loading");
  const hasError = BOARDS.some((b) => boards[b].status === "error");
  const oldestSync = BOARDS.reduce((min, b) => (boards[b].lastSyncedAt < min ? boards[b].lastSyncedAt : min), boards[BOARDS[0]].lastSyncedAt);

  return { boards, isSyncing, hasError, oldestSync, refreshAll };
}