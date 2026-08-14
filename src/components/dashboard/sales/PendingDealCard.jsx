import { usd } from "@/lib/format";
import { Skeleton } from "../Skeleton";

export default function PendingDealCard({ pending, loading = false }) {
  return (
    <div className="grid" style={{ marginTop: 16 }}>
      <div className="panel valuecard pending">
        <div className="cap">Total Pending Deal Value — active pipeline</div>
        <div className="big">{loading ? <Skeleton height={40} width="55%" style={{ margin: "0 auto" }} /> : usd(pending.value)}</div>
        <div style={{ display: "flex", gap: 28, marginTop: 8 }}>
          <div>
            <div className="cap" style={{ fontSize: 11, color: "var(--muted)" }}>
              Pending Deals
            </div>
            <div style={{ fontSize: 18, fontWeight: 700, color: "var(--gold)" }}>
              {loading ? <Skeleton height={18} width={24} /> : pending.count}
            </div>
          </div>
          <div>
            <div className="cap" style={{ fontSize: 11, color: "var(--muted)" }}>
              Phase 1
            </div>
            <div style={{ fontSize: 18, fontWeight: 700, color: "var(--gold)" }}>
              {loading ? <Skeleton height={18} width={80} /> : usd(pending.phase1)}
            </div>
          </div>
          <div>
            <div className="cap" style={{ fontSize: 11, color: "var(--muted)" }}>
              Phase 2
            </div>
            <div style={{ fontSize: 18, fontWeight: 700, color: "var(--gold)" }}>
              {loading ? <Skeleton height={18} width={80} /> : usd(pending.phase2)}
            </div>
          </div>
        </div>
        <div className="note">Client Proposal Review · current snapshot</div>
      </div>
    </div>
  );
}
