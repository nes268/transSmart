import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { getShipperDashboard } from "../services/dashboardService";
import { getShipperTrips } from "../services/tripService";
import { formatDate } from "../utils/formatDate";
import Loader from "../components/common/Loader";

const statCard = (label, value, color) => (
  <div
    key={label}
    className="card"
    style={{
      flex: 1,
      minWidth: "140px",
      borderLeft: `4px solid ${color}`,
    }}
  >
    <div style={{ color: "var(--color-text-muted)", fontSize: "0.875rem", marginBottom: "0.25rem" }}>
      {label}
    </div>
    <div style={{ fontSize: "1.5rem", fontWeight: 700 }}>{value}</div>
  </div>
);

export default function ShipperDashboard() {
  const [data, setData] = useState(null);
  const [trips, setTrips] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    Promise.all([getShipperDashboard(), getShipperTrips()])
      .then(([dashRes, tripsRes]) => {
        setData(dashRes.data);
        setTrips(tripsRes.data || []);
      })
      .catch((err) => setError(err.response?.data?.message || "Failed to load dashboard"))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <Loader />;
  if (error) return <div style={{ color: "var(--color-error)" }}>{error}</div>;

  const { stats, jobs } = data;

  return (
    <div>
      <h1 style={{ marginBottom: "1.5rem" }}>Shipper Dashboard</h1>

      <div style={{ display: "flex", gap: "1rem", flexWrap: "wrap", marginBottom: "2rem" }}>
        {statCard("Total Jobs", stats.totalJobs, "var(--color-primary)")}
        {statCard("Open", stats.openJobs, "var(--color-accent)")}
        {statCard("Accepted", stats.acceptedJobs, "var(--color-warning)")}
        {statCard("Completed", stats.completedJobs, "var(--color-success)")}
      </div>

      <div style={{ display: "flex", gap: "1rem", flexWrap: "wrap", marginBottom: "1.5rem" }}>
        <Link to="/shipper/jobs/new" className="btn btn-primary">Create Job</Link>
        <Link to="/shipper/trips" className="btn btn-secondary">My Trips</Link>
        <Link to="/payments" className="btn btn-secondary">Payment History</Link>
        <Link to="/notifications" className="btn btn-secondary">Notifications</Link>
      </div>

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
        <h2 style={{ fontSize: "1.125rem" }}>Active Trips</h2>
        <Link to="/shipper/trips">View all</Link>
      </div>
      {trips.filter((t) => t.status !== "completed").length === 0 ? (
        <div className="card" style={{ textAlign: "center", color: "var(--color-text-muted)", marginBottom: "2rem" }}>
          No active trips. Trips appear when a transporter accepts your job.
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem", marginBottom: "2rem" }}>
          {trips.filter((t) => t.status !== "completed").slice(0, 3).map((t) => (
            <Link key={t._id} to={`/trips/${t._id}`} className="card" style={{ textDecoration: "none", color: "inherit" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span>{t.job?.title} → {t.transporter?.name}</span>
                <span className={`badge badge-${t.status === "in_transit" || t.status === "delivered" ? "accepted" : "open"}`}>{t.status.replace("_", " ")}</span>
              </div>
            </Link>
          ))}
        </div>
      )}

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
        <h2 style={{ fontSize: "1.125rem" }}>My Jobs</h2>
        <Link to="/shipper/jobs/new" className="btn btn-primary">
          Create Job
        </Link>
      </div>

      {jobs.length === 0 ? (
        <div className="card" style={{ textAlign: "center", color: "var(--color-text-muted)" }}>
          <p>No jobs yet. Create your first job to get started.</p>
          <Link to="/shipper/jobs/new" className="btn btn-primary" style={{ marginTop: "1rem" }}>
            Create Job
          </Link>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
          {jobs.map((job) => (
            <Link
              key={job._id}
              to={`/jobs/${job._id}`}
              className="card"
              style={{
                textDecoration: "none",
                color: "inherit",
                display: "block",
                transition: "border-color 0.2s",
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "0.5rem" }}>
                <div>
                  <div style={{ fontWeight: 600, marginBottom: "0.25rem" }}>{job.title}</div>
                  <div style={{ fontSize: "0.875rem", color: "var(--color-text-muted)" }}>
                    {job.pickupLocation} → {job.deliveryLocation}
                  </div>
                  <div style={{ fontSize: "0.75rem", color: "var(--color-text-muted)", marginTop: "0.25rem" }}>
                    {formatDate(job.createdAt)}
                  </div>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                  <span className={`badge badge-${job.status}`}>{job.status}</span>
                  <span style={{ fontWeight: 600, color: "var(--color-primary)" }}>₹{job.price}</span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
