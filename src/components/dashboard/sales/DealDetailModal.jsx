"use client";

import { usd } from "@/lib/format";
import Modal from "../Modal";

/* Full deal list behind a pipeline-stage chart click — `selection` is null when closed. */
export default function DealDetailModal({ selection, onClose }) {
  if (!selection) return null;

  const { title, deals } = selection;
  const total = deals.reduce((sum, d) => sum + d.value, 0);

  return (
    <Modal title={title} subtitle={`${deals.length} deal${deals.length !== 1 ? "s" : ""} · ${usd(total)} total`} onClose={onClose}>
      {deals.length === 0 ? (
        <div style={{ color: "var(--muted)", padding: 12 }}>No deals in this stage.</div>
      ) : (
        <table>
          <thead>
            <tr>
              <th>Property</th>
              <th>Phase 1</th>
              <th>Phase 2</th>
              <th>Total Value</th>
            </tr>
          </thead>
          <tbody>
            {deals.map((d, i) => (
              <tr key={i}>
                <td className="proj">{d.project}</td>
                <td className="mono">{usd(d.phase1)}</td>
                <td className="mono">{usd(d.phase2)}</td>
                <td className="mono">{usd(d.value)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </Modal>
  );
}
