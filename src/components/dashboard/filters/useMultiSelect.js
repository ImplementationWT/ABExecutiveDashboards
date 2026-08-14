"use client";

import { useMemo, useState } from "react";

/* Manages a "select some/all of N items" filter, matching the dashboard's
   checkbox-dropdown behavior: an "All" checkbox that toggles everything,
   individual checkboxes that keep "All" in sync, and a summary label. */
export function useMultiSelect(items, allLabel) {
  const [selected, setSelected] = useState(() => new Set(items));

  const label = useMemo(() => {
    if (selected.size === items.length) return allLabel;
    if (selected.size === 0) return "None";
    return `${selected.size} selected`;
  }, [selected, items.length, allLabel]);

  const toggleAll = (checked) => setSelected(checked ? new Set(items) : new Set());

  const toggleOne = (value, checked) =>
    setSelected((prev) => {
      const next = new Set(prev);
      checked ? next.add(value) : next.delete(value);
      return next;
    });

  const reset = () => setSelected(new Set(items));

  return { selected, label, toggleAll, toggleOne, reset, setSelected };
}
