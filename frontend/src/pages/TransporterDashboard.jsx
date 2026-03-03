import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { getTransporterDashboard } from "../services/dashboardService";
import { formatDate } from "../utils/formatDate";
import Loader from "../components/common/Loader";

const statCard = (label, value, color) => (
  <div
    key={label}
    className="card"
    style={{ flex: 1, minWidth: "140px", borderLeft: `4px solid ${color}` }}
  >
    <div style={{ color: "var(--color-text-muted)", fontSize: "0.875rem", marginBottom: "0.25rem" }}>{label}</div>
    <div style={{ fontSize: "1.5rem", fontWeight: 700 }}>{value}</div>
  </div>
);

export default function TransporterDashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    getTransporterDashboard()
      .then((res) => setData(res.data))
      .catch((err) => setError(err.response?.data?.message || "Failed to load dashboard"))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <Loader />;
  if (error) return <div style={{ color: "var(--color-error)" }}>{error}</div>;

  const { stats, jobs } = data;

  return (
    <div>
      <h1 style={{ marginBottom: "1.5rem" }}>Transporter Dashboard</h1>

      <div style={{ display: "flex", gap: "1rem", flexWrap: "wrap", marginBottom: "2rem" }}>
        {statCard("Total Accepted", stats.totalAccepted, "var(--color-primary)")}
        {statCard("Active", stats.activeJobs, "var(--color-warning)")}
        {statCard("Completed", stats.completedJobs, "var(--color-success)")}
      </div>

      <div style={{ display: "flex", gap: "1rem", flexWrap: "wrap", marginBottom: "1.5rem" }}>
        <Link to="/transporter/jobs" className="btn btn-secondary">Browse Jobs</Link>
        <Link to="/transporter/trucks" className="btn btn-secondary">My Trucks</Link>
        <Link to="/transporter/trips" className="btn btn-secondary">My Trips</Link>
        <Link to="/payments" className="btn btn-secondary">Earnings</Link>
        <Link to="/notifications" className="btn btn-secondary">Notifications</Link>
        <Link to="/reviews" className="btn btn-secondary">Reviews</Link>
      </div>

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
        <h2 style={{ fontSize: "1.125rem" }}>My Jobs</h2>
        <Link to="/transporter/jobs" className="btn btn-secondary">
          Browse Jobs
        </Link>
      </div>

      {jobs.length === 0 ? (
        <div className="card" style={{ textAlign: "center", color: "var(--color-text-muted)" }}>
          <p>No jobs accepted yet. Browse open jobs to get started.</p>
          <Link to="/transporter/jobs" className="btn btn-primary" style={{ marginTop: "1rem" }}>
            Browse Jobs
          </Link>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
          {jobs.map((job) => (
            <Link
              key={job._id}
              to={`/jobs/${job._id}`}
              className="card"
              style={{ textDecoration: "none", color: "inherit" }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap" }}>
                <div>
                  <div style={{ fontWeight: 600 }}>{job.title}</div>
                  <div style={{ fontSize: "0.875rem", color: "var(--color-text-muted)" }}>
                    {job.pickupLocation} → {job.deliveryLocation}
                  </div>
                  <div style={{ fontSize: "0.75rem", color: "var(--color-text-muted)", marginTop: "0.25rem" }}>
                    {formatDate(job.updatedAt)}
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
