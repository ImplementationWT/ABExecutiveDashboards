export async function fetchBoardData(board) {
  const res = await fetch(`/api/data/${board}`, { cache: "no-store" });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error || `Failed to load ${board} (${res.status})`);
  }
  return res.json();
}

/* Triggers the real N8N sync for this board (see /api/sync/[board]) and
   returns the fresh snapshot it re-read from Mongo afterward. */
export async function triggerBoardSync(board) {
  const res = await fetch(`/api/sync/${board}`, { method: "POST" });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error || `Failed to sync ${board} (${res.status})`);
  }
  return res.json();
}
