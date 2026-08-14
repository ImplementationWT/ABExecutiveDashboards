import { NextResponse } from "next/server";
import { getDb } from "@/lib/mongodb";
import { BOARD_COLLECTIONS, SNAPSHOT_ID, SNAPSHOT_ID_FIELD, isBoardKey } from "@/lib/boards";

export async function GET(request, { params }) {
  const { board } = await params;

  if (!isBoardKey(board)) {
    return NextResponse.json({ error: `Unknown board "${board}"` }, { status: 404 });
  }

  const db = await getDb();
  const snapshot = await db.collection(BOARD_COLLECTIONS[board]).findOne({ [SNAPSHOT_ID_FIELD]: SNAPSHOT_ID });

  if (!snapshot) {
    return NextResponse.json({ error: `No snapshot yet for "${board}" — waiting on its first N8N sync` }, { status: 404 });
  }

  return NextResponse.json(snapshot);
}
