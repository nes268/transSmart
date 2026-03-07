import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { getInvoiceById } from "../services/invoiceService";
import { formatDate } from "../utils/formatDate";
import Loader from "../components/common/Loader";
import { ArrowLeft, Printer } from "lucide-react";

export default function InvoiceView() {
  const { id } = useParams();
  const [invoice, setInvoice] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getInvoiceById(id)
      .then((res) => setInvoice(res?.data))
      .catch(() => setInvoice(null))
      .finally(() => setLoading(false));
  }, [id]);

  const handlePrint = () => {
    window.print();
  };

  if (loading) return <Loader />;
  if (!invoice) return <div className="alert alert-error">Invoice not found</div>;

  const subtotal = invoice.amount || 0;
  const gstAmount = invoice.gstAmount || 0;
  const total = invoice.totalAmount || subtotal + gstAmount;

  return (
    <div className="animate-in">
      <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "1rem" }} className="no-print">
        <Link to="/invoices" className="back-link">
          <ArrowLeft size={16} /> Back to Invoices
        </Link>
        <button
          type="button"
          className="btn btn-secondary btn-sm"
          onClick={handlePrint}
          style={{ marginLeft: "auto" }}
        >
          <Printer size={16} /> Print / Save as PDF
        </button>
      </div>

      <div id="invoice-print" className="card" style={{ maxWidth: "720px" }}>
        <div style={{ padding: "2rem" }}>
          {/* Header */}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "2rem", borderBottom: "1px solid var(--color-border)", paddingBottom: "1.5rem" }}>
            <div>
              <h1 style={{ fontSize: "1.5rem", fontWeight: 700, margin: 0, color: "var(--color-primary)" }}>TransSmart</h1>
              <p style={{ fontSize: "0.8125rem", color: "var(--color-text-muted)", marginTop: "0.25rem" }}>Logistics & Freight Solutions</p>
            </div>
            <div style={{ textAlign: "right" }}>
              <div style={{ fontSize: "1.25rem", fontWeight: 700, color: "var(--color-text)" }}>TAX INVOICE</div>
              <div style={{ fontSize: "1rem", fontWeight: 600, marginTop: "0.5rem" }}>{invoice.invoiceNumber}</div>
              <div style={{ fontSize: "0.8125rem", color: "var(--color-text-muted)", marginTop: "0.25rem" }}>Date: {formatDate(invoice.createdAt)}</div>
            </div>
          </div>

          {/* From / To */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "2rem", marginBottom: "2rem" }}>
            <div>
              <div style={{ fontSize: "0.75rem", fontWeight: 600, color: "var(--color-text-muted)", textTransform: "uppercase", marginBottom: "0.5rem" }}>From (Shipper)</div>
              <div style={{ fontWeight: 600 }}>{invoice.shipper?.name}</div>
              <div style={{ fontSize: "0.875rem", color: "var(--color-text-secondary)" }}>{invoice.shipper?.email}</div>
              {invoice.shipper?.phone && <div style={{ fontSize: "0.875rem", color: "var(--color-text-secondary)" }}>{invoice.shipper.phone}</div>}
            </div>
            <div>
              <div style={{ fontSize: "0.75rem", fontWeight: 600, color: "var(--color-text-muted)", textTransform: "uppercase", marginBottom: "0.5rem" }}>To (Transporter)</div>
              <div style={{ fontWeight: 600 }}>{invoice.transporter?.name}</div>
              <div style={{ fontSize: "0.875rem", color: "var(--color-text-secondary)" }}>{invoice.transporter?.email}</div>
              {invoice.transporter?.phone && <div style={{ fontSize: "0.875rem", color: "var(--color-text-secondary)" }}>{invoice.transporter.phone}</div>}
            </div>
          </div>

          {/* Job Details */}
          <div style={{ marginBottom: "2rem" }}>
            <div style={{ fontSize: "0.75rem", fontWeight: 600, color: "var(--color-text-muted)", textTransform: "uppercase", marginBottom: "0.75rem" }}>Job Details</div>
            <div style={{ background: "var(--color-surface)", borderRadius: "var(--radius)", padding: "1rem" }}>
              <div style={{ fontWeight: 600, marginBottom: "0.5rem" }}>{invoice.job?.title}</div>
              <div style={{ fontSize: "0.875rem", color: "var(--color-text-secondary)", marginBottom: "0.25rem" }}>
                <strong>Pickup:</strong> {invoice.job?.pickupLocation}
              </div>
              <div style={{ fontSize: "0.875rem", color: "var(--color-text-secondary)" }}>
                <strong>Delivery:</strong> {invoice.job?.deliveryLocation}
              </div>
              {invoice.job?.requiredCapacity > 0 && (
                <div style={{ fontSize: "0.875rem", color: "var(--color-text-secondary)", marginTop: "0.25rem" }}>
                  Capacity: {invoice.job.requiredCapacity} tons
                </div>
              )}
            </div>
          </div>

          {/* Amount Table */}
          <div style={{ marginBottom: "2rem" }}>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ borderBottom: "2px solid var(--color-border)" }}>
                  <th style={{ textAlign: "left", padding: "0.75rem 0", fontSize: "0.75rem", fontWeight: 600, color: "var(--color-text-muted)", textTransform: "uppercase" }}>Description</th>
                  <th style={{ textAlign: "right", padding: "0.75rem 0", fontSize: "0.75rem", fontWeight: 600, color: "var(--color-text-muted)", textTransform: "uppercase" }}>Amount (₹)</th>
                </tr>
              </thead>
              <tbody>
                <tr style={{ borderBottom: "1px solid var(--color-border)" }}>
                  <td style={{ padding: "1rem 0" }}>Freight charges - {invoice.job?.title}</td>
                  <td style={{ padding: "1rem 0", textAlign: "right" }}>{subtotal.toLocaleString("en-IN")}</td>
                </tr>
                {gstAmount > 0 && (
                  <tr style={{ borderBottom: "1px solid var(--color-border)" }}>
                    <td style={{ padding: "1rem 0" }}>GST @ {invoice.gstPercent || 18}%</td>
                    <td style={{ padding: "1rem 0", textAlign: "right" }}>{gstAmount.toLocaleString("en-IN")}</td>
                  </tr>
                )}
              </tbody>
            </table>
            <div style={{ display: "flex", justifyContent: "flex-end", marginTop: "1rem" }}>
              <div style={{ textAlign: "right" }}>
                <div style={{ fontSize: "0.875rem", color: "var(--color-text-muted)", marginBottom: "0.25rem" }}>Total</div>
                <div style={{ fontSize: "1.5rem", fontWeight: 700, color: "var(--color-primary)" }}>₹{total.toLocaleString("en-IN")}</div>
              </div>
            </div>
          </div>

          {/* Status */}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", paddingTop: "1.5rem", borderTop: "1px solid var(--color-border)" }}>
            <span className={`badge badge-${invoice.status === "paid" ? "completed" : "accepted"}`}>
              {invoice.status === "paid" ? "Paid" : "Pending"}
            </span>
            {invoice.paidAt && (
              <span style={{ fontSize: "0.8125rem", color: "var(--color-text-muted)" }}>
                Paid on {formatDate(invoice.paidAt)}
              </span>
            )}
          </div>

        </div>
      </div>

      <style>{`
        @media print {
          .no-print { display: none !important; }
          body { background: white; }
          #invoice-print { box-shadow: none; border: 1px solid #ddd; }
        }
      `}</style>
    </div>
  );
}
