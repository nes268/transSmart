import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { getMyInvoices } from "../services/invoiceService";
import { formatDate } from "../utils/formatDate";
import Loader from "../components/common/Loader";
import { FileText } from "lucide-react";

export default function Invoices() {
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getMyInvoices()
      .then((res) => setInvoices(res?.data || []))
      .catch(() => setInvoices([]))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <Loader />;

  return (
    <div className="animate-in">
      <div className="page-header">
        <div>
          <h1 className="page-title">Invoices</h1>
          <p className="page-subtitle">View and download your invoices</p>
        </div>
      </div>

      {invoices.length === 0 ? (
        <div className="card">
          <div className="empty-state">
            <FileText size={32} className="empty-state-icon" />
            <p className="empty-state-text">No invoices yet.</p>
            <p style={{ fontSize: "0.875rem", color: "var(--color-text-muted)", marginTop: "0.5rem" }}>
              Invoices are created automatically when you create a payment for a completed job.
            </p>
          </div>
        </div>
      ) : (
        <div className="list-stack">
          {invoices.map((inv) => (
            <Link
              key={inv._id}
              to={`/invoices/${inv._id}`}
              className="card card-hover card-interactive"
            >
              <div className="list-item">
                <div>
                  <div className="list-item-title">{inv.invoiceNumber}</div>
                  <div className="list-item-sub">
                    {inv.job?.title}
                  </div>
                  <div className="list-item-meta">
                    {formatDate(inv.createdAt)}
                    {inv.shipper?.name && ` • From ${inv.shipper.name}`}
                    {inv.transporter?.name && ` • To ${inv.transporter.name}`}
                  </div>
                </div>
                <div className="list-item-actions">
                  <span className={`badge badge-${inv.status === "paid" ? "completed" : "accepted"}`}>
                    {inv.status}
                  </span>
                  <span className="list-item-price">₹{inv.totalAmount}</span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
