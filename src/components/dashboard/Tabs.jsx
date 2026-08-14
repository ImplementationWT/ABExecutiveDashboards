"use client";

const TABS = [
  { id: "p1", ix: "01", label: "Planning & Design" },
  { id: "p3", ix: "02", label: "Financial" },
  { id: "p2", ix: "03", label: "Design | Build Sales" },
];

export default function Tabs({ active, onChange }) {
  return (
    <nav className="tabs">
      {TABS.map((tab) => (
        <button
          key={tab.id}
          type="button"
          className={`tab${active === tab.id ? " active" : ""}`}
          onClick={() => onChange(tab.id)}
        >
          <span className="ix">{tab.ix}</span> {tab.label}
        </button>
      ))}
    </nav>
  );
}
