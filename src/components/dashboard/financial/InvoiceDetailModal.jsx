"use client";

import { usd } from "@/lib/format";
import Modal from "../Modal";

/* Full invoice detail behind a chart click — `selection` is null when closed. */
export default function InvoiceDetailModal({ selection, onClose }) {
  if (!selection) return null;

  const { title, rows } = selection;
  const totalInvoiced = rows.reduce((sum, r) => sum + r.invoiced, 0);
  const totalReceived = rows.reduce((sum, r) => sum + r.received, 0);

  return (
    <Modal
      title={title}
      subtitle={`${rows.length} invoice${rows.length !== 1 ? "s" : ""} · ${usd(totalInvoiced)} invoiced · ${usd(totalReceived)} received`}
      onClose={onClose}
    >
      {rows.length === 0 ? (
        <div style={{ color: "var(--muted)", padding: 12 }}>No invoices in this selection.</div>
      ) : (
        <table>
          <thead>
            <tr>
              <th>Project</th>
              <th>Task</th>
              <th>Status</th>
              <th>Invoiced</th>
              <th>Received</th>
              <th>Invoice Date</th>
              <th>Paid Date</th>
              <th>Expected Date</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r, i) => (
              <tr key={i}>
                <td className="proj">{r.project}</td>
                <td>{r.task}</td>
                <td>{r.status}</td>
                <td className="mono">{usd(r.invoiced)}</td>
                <td className="mono">{usd(r.received)}</td>
                <td className="mono">{r.invDate || "—"}</td>
                <td className="mono">{r.paidDate || "—"}</td>
                <td className="mono">{r.expDate || "—"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </Modal>
  );
}