import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { getShipperDashboard } from "../services/dashboardService";
import { getShipperTrips } from "../services/tripService";
import { getMyPayments, createPayment, markAsPaid } from "../services/paymentService";
import { formatDate } from "../utils/formatDate";
import Loader from "../components/common/Loader";
import ChatbotWidget from "../components/chat/ChatbotWidget";

export default function ShipperDashboard() {
  const [data, setData] = useState(null);
  const [trips, setTrips] = useState([]);
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [createLoading, setCreateLoading] = useState(null);
  const [actionLoading, setActionLoading] = useState(null);
  const [showMarkPaid, setShowMarkPaid] = useState(null);
  const [paymentMethod, setPaymentMethod] = useState("upi");

  const loadData = () => {
    Promise.all([getShipperDashboard(), getShipperTrips(), getMyPayments()])
      .then(([dashRes, tripsRes, paymentsRes]) => {
        setData(dashRes?.data ?? null);
        const tripList = Array.isArray(tripsRes?.data) ? tripsRes.data : [];
        setTrips(tripList);
        const paymentList = Array.isArray(paymentsRes?.data) ? paymentsRes.data : [];
        setPayments(paymentList);
      })
      .catch((err) =>
        setError(err.response?.data?.message || "Failed to load dashboard")
      )
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadData();
  }, []);

  if (loading) return <Loader />;
  if (error) return <div className="alert alert-error">{error}</div>;
  if (!data) return <div className="alert alert-error">Failed to load dashboard</div>;

  const { stats, jobs } = data;

  const completedJobs = (jobs || []).filter((j) => j.status === "completed");
  const paidJobIds = (payments || []).map((p) => p.job?._id);
  const jobsNeedingPayment = completedJobs.filter((j) => !paidJobIds.includes(j._id));
  const pendingPayments = (payments || []).filter((p) => p.status === "pending");

  const handleCreatePayment = async (jobId, e) => {
    e?.preventDefault?.();
    e?.stopPropagation?.();
    setCreateLoading(jobId);
    try {
      const res = await createPayment(jobId);
      const payment = res?.data;
      if (payment) {
        setPayments((prev) => [payment, ...(prev || [])]);
      } else {
        loadData();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setCreateLoading(null);
    }
  };

  const handleMarkPaid = async () => {
    if (!showMarkPaid) return;
    setActionLoading(showMarkPaid);
    try {
      const res = await markAsPaid(showMarkPaid, paymentMethod);
      setShowMarkPaid(null);
      const payment = res?.data;
      if (payment) {
        setPayments((prev) =>
          (prev || []).map((p) => (p._id === payment._id ? payment : p))
        );
      } else {
        loadData();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setActionLoading(null);
    }
  };

  return (
    <div className="animate-in">
      <div className="page-header">
        <div>
          <h1 className="page-title">Dashboard</h1>
          <p className="page-subtitle">Overview of your shipping activity</p>
        </div>
        <Link to="/shipper/jobs/new" className="btn btn-primary">
          Create Job
        </Link>
      </div>

      <div className="stat-grid" style={{ marginBottom: "2rem" }}>
        <div className="stat-card stat-card-purple">
          <div className="stat-card-header">
            <span className="stat-card-label">Total Jobs</span>
          </div>
          <div className="stat-card-value">{stats.totalJobs}</div>
        </div>
        <div className="stat-card stat-card-cyan">
          <div className="stat-card-header">
            <span className="stat-card-label">Open</span>
          </div>
          <div className="stat-card-value">{stats.openJobs}</div>
        </div>
        <div className="stat-card stat-card-amber">
          <div className="stat-card-header">
            <span className="stat-card-label">Accepted</span>
          </div>
          <div className="stat-card-value">{stats.acceptedJobs}</div>
        </div>
        <div className="stat-card stat-card-green">
          <div className="stat-card-header">
            <span className="stat-card-label">Completed</span>
          </div>
          <div className="stat-card-value">{stats.completedJobs}</div>
        </div>
        <div className="stat-card stat-card-cyan">
          <div className="stat-card-header">
            <span className="stat-card-label">Total Spending</span>
          </div>
          <div className="stat-card-value">₹{stats.totalSpending ?? 0}</div>
        </div>
      </div>

      <div className="quick-actions" style={{ marginBottom: "2rem" }}>
        <Link to="/shipper/trucks" className="btn btn-secondary btn-sm">Browse Trucks</Link>
        <Link to="/shipper/trips" className="btn btn-secondary btn-sm">My Trips</Link>
        <Link to="/payments" className="btn btn-secondary btn-sm">Payments</Link>
        <Link to="/notifications" className="btn btn-secondary btn-sm">Notifications</Link>
      </div>

      {(jobsNeedingPayment.length > 0 || pendingPayments.length > 0) && (
        <div className="card" style={{ marginBottom: "2rem" }}>
          <div className="section-header" style={{ marginBottom: "1rem" }}>
            <h2 className="section-title">Make Payment</h2>
            <Link to="/payments" className="btn btn-ghost btn-sm">View all</Link>
          </div>
          <p style={{ color: "var(--color-text-muted)", fontSize: "0.875rem", marginBottom: "1rem" }}>
            Pay transporters for completed jobs
          </p>

          {jobsNeedingPayment.length > 0 && (
            <div style={{ marginBottom: "1rem" }}>
              <div style={{ fontSize: "0.75rem", fontWeight: 600, color: "var(--color-text-muted)", marginBottom: "0.5rem" }}>Create payment</div>
              <div className="list-stack">
                {jobsNeedingPayment.map((j) => (
                  <div key={j._id} className="list-item" style={{ padding: "0.5rem 0" }}>
                    <div>
                      <span className="list-item-title">{j.title}</span>
                      <span className="list-item-price" style={{ marginLeft: "0.75rem" }}>₹{j.price}</span>
                    </div>
                    <button
                      className="btn btn-primary btn-sm"
                      disabled={createLoading === j._id}
                      onClick={(e) => handleCreatePayment(j._id, e)}
                    >
                      {createLoading === j._id ? "Creating..." : "Create & Pay"}
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {pendingPayments.length > 0 && (
            <div>
              <div style={{ fontSize: "0.75rem", fontWeight: 600, color: "var(--color-text-muted)", marginBottom: "0.5rem" }}>Mark as paid</div>
              <div className="list-stack">
                {pendingPayments.map((p) => (
                  <div key={p._id} className="list-item" style={{ padding: "0.5rem 0" }}>
                    <div>
                      <span className="list-item-title">
                        ₹{p.amount} — {p.job?.title || "Job"}
                      </span>
                    </div>
                    <button
                      className="btn btn-primary btn-sm"
                      disabled={actionLoading === p._id}
                      onClick={(e) => {
                        e?.preventDefault?.();
                        setShowMarkPaid(p._id);
                      }}
                    >
                      Mark Paid
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
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

      <div className="section-header">
        <h2 className="section-title">Active Trips</h2>
        <Link to="/shipper/trips" className="btn btn-ghost btn-sm">View all</Link>
      </div>
      {trips.filter((t) => t.status !== "completed").length === 0 ? (
        <div className="card" style={{ marginBottom: "2rem" }}>
          <div className="empty-state">
            <p className="empty-state-text">
              No active trips. Trips appear when a transporter accepts your job.
            </p>
          </div>
        </div>
      ) : (
        <div className="list-stack" style={{ marginBottom: "2rem" }}>
          {trips
            .filter((t) => t.status !== "completed")
            .slice(0, 3)
            .map((t) => (
              <Link key={t._id} to={`/trips/${t._id}`} className="card card-hover card-interactive">
                <div className="list-item">
                  <div>
                    <div className="list-item-title">
                      {t.job?.title} → {t.transporter?.name}
                      {t.transporter?.phone && (
                        <span style={{ fontWeight: 400, color: "var(--color-text-muted)", marginLeft: "0.5rem" }}>
                          • {t.transporter.phone}
                        </span>
                      )}
                    </div>
                  </div>
                  <span
                    className={`badge badge-${
                      t.status === "in_transit" || t.status === "delivered"
                        ? "accepted"
                        : "open"
                    }`}
                  >
                    {t.status.replace("_", " ")}
                  </span>
                </div>
              </Link>
            ))}
        </div>
      )}

      <div className="section-header">
        <h2 className="section-title">My Jobs</h2>
        <Link to="/shipper/jobs/new" className="btn btn-primary btn-sm">New Job</Link>
      </div>

      {jobs.length === 0 ? (
        <div className="card">
          <div className="empty-state">
            <p className="empty-state-text">
              No jobs yet. Create your first job to get started.
            </p>
            <Link to="/shipper/jobs/new" className="btn btn-primary" style={{ marginTop: "0.5rem" }}>
              Create Job
            </Link>
          </div>
        </div>
      ) : (
        <div className="list-stack">
          {jobs.map((job) => (
            <Link key={job._id} to={`/jobs/${job._id}`} className="card card-hover card-interactive">
              <div className="list-item">
                <div>
                  <div className="list-item-title">{job.title}</div>
                  <div className="list-item-sub">
                    {job.pickupLocation} → {job.deliveryLocation}
                  </div>
                  <div className="list-item-meta">{formatDate(job.createdAt)}</div>
                </div>
                <div className="list-item-actions">
                  <span className={`badge badge-${job.status}`}>{job.status}</span>
                  <span className="list-item-price">₹{job.price}</span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}

      <ChatbotWidget />
    </div>
  );
}
