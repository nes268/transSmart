import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { getTransporterDashboard } from "../services/dashboardService";
import { formatDate } from "../utils/formatDate";
import Loader from "../components/common/Loader";
import ChatbotWidget from "../components/chat/ChatbotWidget";

export default function TransporterDashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    getTransporterDashboard()
      .then((res) => setData(res?.data ?? null))
      .catch((err) =>
        setError(err.response?.data?.message || "Failed to load dashboard")
      )
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <Loader />;
  if (error) return <div className="alert alert-error">{error}</div>;
  if (!data) return <div className="alert alert-error">Failed to load dashboard</div>;

  const { stats, jobs } = data;

  return (
    <div className="animate-in">
      <div className="page-header">
        <div>
          <h1 className="page-title">Dashboard</h1>
          <p className="page-subtitle">Your transport activity at a glance</p>
        </div>
        <Link to="/transporter/jobs" className="btn btn-primary">
          Browse Jobs
        </Link>
      </div>

      <div className="stat-grid" style={{ marginBottom: "2rem" }}>
        <div className="stat-card stat-card-purple">
          <div className="stat-card-header">
            <span className="stat-card-label">Total Accepted</span>
          </div>
          <div className="stat-card-value">{stats.totalAccepted}</div>
        </div>
        <div className="stat-card stat-card-amber">
          <div className="stat-card-header">
            <span className="stat-card-label">Active</span>
          </div>
          <div className="stat-card-value">{stats.activeJobs}</div>
        </div>
        <div className="stat-card stat-card-green">
          <div className="stat-card-header">
            <span className="stat-card-label">Completed</span>
          </div>
          <div className="stat-card-value">{stats.completedJobs}</div>
        </div>
        <div className="stat-card stat-card-cyan">
          <div className="stat-card-header">
            <span className="stat-card-label">Total Earnings</span>
          </div>
          <div className="stat-card-value">₹{stats.totalEarnings ?? 0}</div>
        </div>
        <div className="stat-card stat-card-amber">
          <div className="stat-card-header">
            <span className="stat-card-label">Avg Rating</span>
          </div>
          <div className="stat-card-value">{stats.averageRating ?? 0}</div>
        </div>
      </div>

      <div className="quick-actions" style={{ marginBottom: "2rem" }}>
        <Link to="/transporter/trucks" className="btn btn-secondary btn-sm">My Trucks</Link>
        <Link to="/transporter/requests" className="btn btn-secondary btn-sm">Requests</Link>
        <Link to="/transporter/trips" className="btn btn-secondary btn-sm">My Trips</Link>
        <Link to="/payments" className="btn btn-secondary btn-sm">Earnings</Link>
        <Link to="/notifications" className="btn btn-secondary btn-sm">Notifications</Link>
        <Link to="/reviews" className="btn btn-secondary btn-sm">Reviews</Link>
      </div>

      <div className="section-header">
        <h2 className="section-title">My Jobs</h2>
        <Link to="/transporter/jobs" className="btn btn-ghost btn-sm">Browse all</Link>
      </div>

      {jobs.length === 0 ? (
        <div className="card">
          <div className="empty-state">
            <p className="empty-state-text">
              No jobs accepted yet. Browse open jobs to get started.
            </p>
            <Link to="/transporter/jobs" className="btn btn-primary" style={{ marginTop: "0.5rem" }}>
              Browse Jobs
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
                  <div className="list-item-meta">{formatDate(job.updatedAt)}</div>
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
