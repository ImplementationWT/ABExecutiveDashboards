/* One monday.com board <-> one Mongo collection <-> one dashboard tab. */
export const BOARD_KEYS = ["planning", "financial", "sales"];

export const BOARD_COLLECTIONS = {
  planning: "planning_snapshot",
  financial: "financial_snapshot",
  sales: "sales_snapshot",
};

/* Each collection holds a single upserted document identified by this fixed
   value in its `docId` field (not Mongo's own `_id` — N8N's Mongo node
   doesn't give reliable control over `_id` on upsert, so we key off a plain
   string field instead and let Mongo assign `_id` however it wants). There's
   no history, just "the latest snapshot N8N wrote for this board". */
export const SNAPSHOT_ID = "latest";
export const SNAPSHOT_ID_FIELD = "docId";

export const isBoardKey = (value) => BOARD_KEYS.includes(value);
