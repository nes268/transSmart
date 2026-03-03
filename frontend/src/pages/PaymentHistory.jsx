import { useState, useEffect } from "react";
import { getMyPayments, markAsPaid, createPayment } from "../services/paymentService";
import { getShipperDashboard } from "../services/dashboardService";
import { useAuth } from "../hooks/useAuth";
import { formatDate } from "../utils/formatDate";
import Loader from "../components/common/Loader";
import { CreditCard, PlusCircle, IndianRupee } from "lucide-react";

export default function PaymentHistory() {
  const { user } = useAuth();
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(null);
  const [showMarkPaid, setShowMarkPaid] = useState(null);
  const [paymentMethod, setPaymentMethod] = useState("upi");
  const [jobsNeedingPayment, setJobsNeedingPayment] = useState([]);
  const [createLoading, setCreateLoading] = useState(null);

  const load = () => {
    getMyPayments()
      .then((res) => setPayments(res.data || []))
      .catch(() => setPayments([]))
      .finally(() => setLoading(false));
  };

  useEffect(() => load(), []);

  useEffect(() => {
    if (user?.role === "shipper") {
      getShipperDashboard()
        .then((res) => {
          const completed = (res.data?.jobs || []).filter(
            (j) => j.status === "completed"
          );
          setJobsNeedingPayment(completed);
        })
        .catch(() => setJobsNeedingPayment([]));
    }
  }, [user?.role]);

  const handleMarkPaid = async () => {
    if (!showMarkPaid) return;
    setActionLoading(showMarkPaid);
    try {
      await markAsPaid(showMarkPaid, paymentMethod);
      setShowMarkPaid(null);
      load();
    } catch (err) {
      console.error(err);
    } finally {
      setActionLoading(null);
    }
  };

  const handleCreatePayment = async (jobId) => {
    setCreateLoading(jobId);
    try {
      await createPayment(jobId);
      load();
    } catch (err) {
      console.error(err);
    } finally {
      setCreateLoading(null);
    }
  };

  if (loading) return <Loader />;

  const paidJobIds = payments.map((p) => p.job?._id);
  const jobsWithoutPayment = jobsNeedingPayment.filter(
    (j) => !paidJobIds.includes(j._id)
  );

  return (
    <div className="animate-in">
      <div className="page-header">
        <div>
          <h1 className="page-title">Payment History</h1>
          <p className="page-subtitle">Track and manage your payments</p>
        </div>
      </div>

      {user?.role === "shipper" && jobsWithoutPayment.length > 0 && (
        <div className="card" style={{ marginBottom: "1.5rem" }}>
          <div className="section-header" style={{ marginBottom: "0.75rem" }}>
            <h3 className="section-title">Create Payment</h3>
          </div>
          <p style={{ color: "var(--color-text-muted)", fontSize: "0.8125rem", marginBottom: "1rem" }}>
            Create payment for completed jobs
          </p>
          <div className="list-stack">
            {jobsWithoutPayment.map((j) => (
              <div key={j._id} className="list-item" style={{ padding: "0.5rem 0" }}>
                <div>
                  <span className="list-item-title">{j.title}</span>
                  <span className="list-item-price" style={{ marginLeft: "0.75rem" }}>₹{j.price}</span>
                </div>
                <button
                  className="btn btn-primary btn-sm"
                  disabled={createLoading === j._id}
                  onClick={() => handleCreatePayment(j._id)}
                >
                  <PlusCircle size={14} />
                  {createLoading === j._id ? "Creating..." : "Create Payment"}
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {payments.length === 0 ? (
        <div className="card">
          <div className="empty-state">
            <CreditCard size={32} className="empty-state-icon" />
            <p className="empty-state-text">No payments yet.</p>
          </div>
        </div>
      ) : (
        <div className="list-stack">
          {payments.map((p) => (
            <div key={p._id} className="card card-hover">
              <div className="list-item">
                <div>
                  <div className="list-item-title" style={{ display: "flex", alignItems: "center", gap: "0.375rem" }}>
                    <IndianRupee size={16} style={{ color: "var(--color-primary)" }} />
                    ₹{p.amount}
                  </div>
                  <div className="list-item-sub">
                    Job: {p.job?.title || p.job?._id || "-"}
                  </div>
                  <div className="list-item-meta">{formatDate(p.createdAt)}</div>
                </div>
                <div className="list-item-actions">
                  <span className={`badge badge-${p.status === "paid" ? "completed" : "accepted"}`}>
                    {p.status}
                  </span>
                  {p.status === "pending" && user?.role === "shipper" && (
                    <button
                      className="btn btn-primary btn-sm"
                      disabled={actionLoading === p._id}
                      onClick={() => setShowMarkPaid(p._id)}
                    >
                      Mark Paid
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {showMarkPaid && (
        <div className="modal-overlay" onClick={() => setShowMarkPaid(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h3 className="modal-title">Mark as Paid</h3>
            <div className="form-group">
              <label>Payment Method</label>
              <select value={paymentMethod} onChange={(e) => setPaymentMethod(e.target.value)}>
                <option value="upi">UPI</option>
                <option value="card">Card</option>
                <option value="netbanking">Net Banking</option>
                <option value="cash">Cash</option>
              </select>
            </div>
            <div style={{ display: "flex", gap: "0.5rem" }}>
              <button className="btn btn-primary" disabled={actionLoading} onClick={handleMarkPaid}>
                {actionLoading ? "Updating..." : "Confirm"}
              </button>
              <button className="btn btn-secondary" onClick={() => setShowMarkPaid(null)}>
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
