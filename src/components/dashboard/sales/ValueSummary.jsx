import { usd } from "@/lib/format";
import { Skeleton } from "../Skeleton";

export default function ValueSummary({ year, totalValue, count, phase1, phase2, loading = false }) {
  return (
    <div className="col">
      <div className="panel valuecard">
        <div className="cap">Total Closed Deal Value {year}</div>
        <div className="big">{loading ? <Skeleton height={40} width="65%" style={{ margin: "0 auto" }} /> : usd(totalValue)}</div>
      </div>
      <div className="trio">
        <div className="stat">
          <div className="cap">Closed Deals</div>
          <div className="big">{loading ? <Skeleton height={25} width="50%" style={{ margin: "6px auto 0" }} /> : count}</div>
        </div>
        <div className="stat">
          <div className="cap">Phase 1</div>
          <div className="big">{loading ? <Skeleton height={25} width="70%" style={{ margin: "6px auto 0" }} /> : usd(phase1)}</div>
        </div>
        <div className="stat">
          <div className="cap">Phase 2</div>
          <div className="big">{loading ? <Skeleton height={25} width="70%" style={{ margin: "6px auto 0" }} /> : usd(phase2)}</div>
        </div>
      </div>
    </div>
  );
}
