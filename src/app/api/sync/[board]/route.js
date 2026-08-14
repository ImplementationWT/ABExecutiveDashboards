import { NextResponse } from "next/server";
import { getDb } from "@/lib/mongodb";
import { BOARD_COLLECTIONS, SNAPSHOT_ID, SNAPSHOT_ID_FIELD, isBoardKey } from "@/lib/boards";

const WEBHOOK_ENV_VAR = {
  planning: "N8N_WEBHOOK_PLANNING",
  financial: "N8N_WEBHOOK_FINANCIAL",
  sales: "N8N_WEBHOOK_SALES",
};

/* Triggers the "Refresh" button's real sync: calls this board's N8N webhook
   (which pulls monday.com, transforms, and upserts into Mongo) and waits for
   it to respond, then re-reads the snapshot Mongo now has. Assumes the N8N
   webhook is configured to respond only once its workflow finishes — if it's
   set to "respond immediately" instead, this will read the snapshot before
   N8N has finished writing it. */
export async function POST(request, { params }) {
  const { board } = await params;

  if (!isBoardKey(board)) {
    return NextResponse.json({ error: `Unknown board "${board}"` }, { status: 404 });
  }

  const webhookUrl = process.env[WEBHOOK_ENV_VAR[board]];
  if (!webhookUrl) {
    return NextResponse.json({ error: `Missing ${WEBHOOK_ENV_VAR[board]} — set it in .env.local` }, { status: 500 });
  }

  try {
    const res = await fetch(webhookUrl, { method: "POST", signal: AbortSignal.timeout(60000) });
    if (!res.ok) {
      return NextResponse.json({ error: `N8N webhook for "${board}" returned ${res.status}` }, { status: 502 });
    }
  } catch (err) {
    const timedOut = err?.name === "TimeoutError";
    return NextResponse.json({ error: timedOut ? `N8N webhook for "${board}" timed out` : `Couldn't reach N8N: ${err.message}` }, { status: 502 });
  }

  const db = await getDb();
  const snapshot = await db.collection(BOARD_COLLECTIONS[board]).findOne({ [SNAPSHOT_ID_FIELD]: SNAPSHOT_ID });

  if (!snapshot) {
    return NextResponse.json({ error: `N8N ran but "${board}" still has no snapshot in Mongo` }, { status: 502 });
  }

  return NextResponse.json(snapshot);
}
