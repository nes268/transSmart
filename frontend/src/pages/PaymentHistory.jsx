import { useState, useEffect } from "react";
import { getMyPayments, markAsPaid, createPayment } from "../services/paymentService";
import { getShipperDashboard } from "../services/dashboardService";
import { useAuth } from "../hooks/useAuth";
import { formatDate } from "../utils/formatDate";
import Loader from "../components/common/Loader";

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

  useEffect(() => {
    load();
  }, []);

  useEffect(() => {
    if (user?.role === "shipper") {
      getShipperDashboard()
        .then((res) => {
          const completed = (res.data?.jobs || []).filter((j) => j.status === "completed");
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

  const pendingPayments = payments.filter((p) => p.status === "pending");
  const paidJobIds = payments.map((p) => p.job?._id);
  const jobsWithoutPayment = jobsNeedingPayment.filter((j) => !paidJobIds.includes(j._id));

  return (
    <div>
      <h1 style={{ marginBottom: "1.5rem" }}>Payment History</h1>

      {user?.role === "shipper" && jobsWithoutPayment.length > 0 && (
        <div className="card" style={{ marginBottom: "1.5rem" }}>
          <h3 style={{ marginBottom: "0.75rem" }}>Create Payment</h3>
          <p style={{ color: "var(--color-text-muted)", fontSize: "0.875rem", marginBottom: "1rem" }}>
            Create payment for completed jobs
          </p>
          <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
            {jobsWithoutPayment.map((j) => (
              <div key={j._id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "0.5rem 0" }}>
                <span>{j.title} - ₹{j.price}</span>
                <button
                  className="btn btn-primary"
                  style={{ fontSize: "0.8125rem" }}
                  disabled={createLoading === j._id}
                  onClick={() => handleCreatePayment(j._id)}
                >
                  {createLoading === j._id ? "Creating..." : "Create Payment"}
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {payments.length === 0 ? (
        <div className="card" style={{ textAlign: "center", color: "var(--color-text-muted)" }}>
          No payments yet.
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
          {payments.map((p) => (
            <div key={p._id} className="card" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap" }}>
              <div>
                <div style={{ fontWeight: 600 }}>₹{p.amount}</div>
                <div style={{ fontSize: "0.875rem", color: "var(--color-text-muted)" }}>
                  Job: {p.job?.title || p.job?._id || "-"}
                </div>
                <div style={{ fontSize: "0.75rem", color: "var(--color-text-muted)" }}>{formatDate(p.createdAt)}</div>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                <span className={`badge badge-${p.status === "paid" ? "completed" : "accepted"}`}>{p.status}</span>
                {p.status === "pending" && user?.role === "shipper" && (
                  <button
                    className="btn btn-primary"
                    style={{ fontSize: "0.8125rem" }}
                    disabled={actionLoading === p._id}
                    onClick={() => setShowMarkPaid(p._id)}
                  >
                    Mark Paid
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {showMarkPaid && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.6)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 100,
          }}
          onClick={() => setShowMarkPaid(null)}
        >
          <div className="card" style={{ maxWidth: "360px", width: "90%" }} onClick={(e) => e.stopPropagation()}>
            <h3 style={{ marginBottom: "1rem" }}>Mark as Paid</h3>
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
              <button className="btn btn-secondary" onClick={() => setShowMarkPaid(null)}>Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
