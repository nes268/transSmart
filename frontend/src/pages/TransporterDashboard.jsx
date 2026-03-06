import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { getTransporterDashboard } from "../services/dashboardService";
import { formatDate } from "../utils/formatDate";
import Loader from "../components/common/Loader";
import {
  Package,
  Loader2,
  CheckCircle2,
  Search,
  Truck,
  MapPin,
  CreditCard,
  Bell,
  Star,
  ArrowRight,
  Send,
  IndianRupee,
} from "lucide-react";
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
          <Search size={16} />
          Browse Jobs
        </Link>
      </div>

      <div className="stat-grid" style={{ marginBottom: "2rem" }}>
        <div className="stat-card stat-card-purple">
          <div className="stat-card-header">
            <span className="stat-card-label">Total Accepted</span>
            <div className="stat-card-icon"><Package size={18} /></div>
          </div>
          <div className="stat-card-value">{stats.totalAccepted}</div>
        </div>
        <div className="stat-card stat-card-amber">
          <div className="stat-card-header">
            <span className="stat-card-label">Active</span>
            <div className="stat-card-icon amber"><Loader2 size={18} /></div>
          </div>
          <div className="stat-card-value">{stats.activeJobs}</div>
        </div>
        <div className="stat-card stat-card-green">
          <div className="stat-card-header">
            <span className="stat-card-label">Completed</span>
            <div className="stat-card-icon green"><CheckCircle2 size={18} /></div>
          </div>
          <div className="stat-card-value">{stats.completedJobs}</div>
        </div>
        <div className="stat-card stat-card-cyan">
          <div className="stat-card-header">
            <span className="stat-card-label">Total Earnings</span>
            <div className="stat-card-icon cyan"><IndianRupee size={18} /></div>
          </div>
          <div className="stat-card-value">₹{stats.totalEarnings ?? 0}</div>
        </div>
        <div className="stat-card stat-card-amber">
          <div className="stat-card-header">
            <span className="stat-card-label">Avg Rating</span>
            <div className="stat-card-icon amber"><Star size={18} /></div>
          </div>
          <div className="stat-card-value">{stats.averageRating ?? 0}</div>
        </div>
      </div>

      <div className="quick-actions" style={{ marginBottom: "2rem" }}>
        <Link to="/transporter/trucks" className="btn btn-secondary btn-sm">
          <Truck size={14} /> My Trucks
        </Link>
        <Link to="/transporter/requests" className="btn btn-secondary btn-sm">
          <Send size={14} /> Requests
        </Link>
        <Link to="/transporter/trips" className="btn btn-secondary btn-sm">
          <MapPin size={14} /> My Trips
        </Link>
        <Link to="/payments" className="btn btn-secondary btn-sm">
          <CreditCard size={14} /> Earnings
        </Link>
        <Link to="/notifications" className="btn btn-secondary btn-sm">
          <Bell size={14} /> Notifications
        </Link>
        <Link to="/reviews" className="btn btn-secondary btn-sm">
          <Star size={14} /> Reviews
        </Link>
      </div>

      <div className="section-header">
        <h2 className="section-title">My Jobs</h2>
        <Link to="/transporter/jobs" className="btn btn-ghost btn-sm">
          Browse all <ArrowRight size={14} />
        </Link>
      </div>

      {jobs.length === 0 ? (
        <div className="card">
          <div className="empty-state">
            <Package size={32} className="empty-state-icon" />
            <p className="empty-state-text">
              No jobs accepted yet. Browse open jobs to get started.
            </p>
            <Link to="/transporter/jobs" className="btn btn-primary" style={{ marginTop: "0.5rem" }}>
              <Search size={16} /> Browse Jobs
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
