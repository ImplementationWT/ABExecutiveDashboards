"use client";

import { useEffect, useRef, useState } from "react";

/* Checkbox dropdown for filtering by project/owner/status, e.g. "3 selected". */
export default function MultiSelectDropdown({ label, items, itemLabel, selected, onToggleAll, onToggleOne, summary }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    if (!open) return;
    const onDocClick = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("click", onDocClick);
    return () => document.removeEventListener("click", onDocClick);
  }, [open]);

  const allChecked = selected.size === items.length;

  return (
    <div className="field">
      <label>{label}</label>
      <div className="dropdown" ref={ref}>
        <button type="button" className="dd-btn" onClick={() => setOpen((o) => !o)}>
          <span>{summary}</span>
          <span className="car">▾</span>
        </button>
        <div className={`dd-menu${open ? " open" : ""}`}>
          <label style={{ borderBottom: "1px solid var(--line)", marginBottom: 4 }}>
            <input type="checkbox" checked={allChecked} onChange={(e) => onToggleAll(e.target.checked)} />
            <b>All</b>
          </label>
          {items.map((item) => (
            <label key={item}>
              <input type="checkbox" checked={selected.has(item)} onChange={(e) => onToggleOne(item, e.target.checked)} />
              {itemLabel ? itemLabel(item) : item}
            </label>
          ))}
        </div>
      </div>
    </div>
  );
}