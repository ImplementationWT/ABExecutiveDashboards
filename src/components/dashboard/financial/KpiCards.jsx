import { usd } from "@/lib/format";
import { Skeleton } from "../Skeleton";

export default function KpiCards({ totalInvoiced, totalReceived, totalDue, upcoming, loading = false }) {
  const kpis = [
    { label: "Total Invoiced", value: usd(totalInvoiced), footer: "all invoices · billed + upcoming", accent: "#4a90e2" },
    { label: "Total Received", value: usd(totalReceived), footer: "collected to date", accent: "#2bd49b" },
    { label: "Amount Due", value: usd(totalDue), footer: "past due, unpaid", accent: "#ef4d63" },
    { label: "Upcoming Inflow", value: usd(upcoming), footer: "scheduled · not yet billed", accent: "#f0a92b" },
  ];

  return (
    <div className="kpis k4">
      {kpis.map((k) => (
        <div key={k.label} className="kpi" style={{ "--accent": k.accent }}>
          <div className="l">{k.label}</div>
          <div className="v">{loading ? <Skeleton height={28} width="70%" /> : k.value}</div>
          <div className="f">{k.footer}</div>
        </div>
      ))}
    </div>
  );
}