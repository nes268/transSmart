import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { getShipperDashboard } from "../services/dashboardService";
import { getShipperTrips } from "../services/tripService";
import { formatDate } from "../utils/formatDate";
import Loader from "../components/common/Loader";
import {
  Package,
  Clock,
  CheckCircle2,
  Loader2,
  PlusCircle,
  MapPin,
  Truck,
  CreditCard,
  Bell,
  ArrowRight,
  Phone,
} from "lucide-react";

export default function ShipperDashboard() {
  const [data, setData] = useState(null);
  const [trips, setTrips] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    Promise.all([getShipperDashboard(), getShipperTrips()])
      .then(([dashRes, tripsRes]) => {
        setData(dashRes?.data ?? null);
        const tripList = Array.isArray(tripsRes?.data) ? tripsRes.data : [];
        setTrips(tripList);
      })
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
          <p className="page-subtitle">Overview of your shipping activity</p>
        </div>
        <Link to="/shipper/jobs/new" className="btn btn-primary">
          <PlusCircle size={16} />
          Create Job
        </Link>
      </div>

      <div className="stat-grid" style={{ marginBottom: "2rem" }}>
        <div className="stat-card stat-card-purple">
          <div className="stat-card-header">
            <span className="stat-card-label">Total Jobs</span>
            <div className="stat-card-icon"><Package size={18} /></div>
          </div>
          <div className="stat-card-value">{stats.totalJobs}</div>
        </div>
        <div className="stat-card stat-card-cyan">
          <div className="stat-card-header">
            <span className="stat-card-label">Open</span>
            <div className="stat-card-icon cyan"><Clock size={18} /></div>
          </div>
          <div className="stat-card-value">{stats.openJobs}</div>
        </div>
        <div className="stat-card stat-card-amber">
          <div className="stat-card-header">
            <span className="stat-card-label">Accepted</span>
            <div className="stat-card-icon amber"><Loader2 size={18} /></div>
          </div>
          <div className="stat-card-value">{stats.acceptedJobs}</div>
        </div>
        <div className="stat-card stat-card-green">
          <div className="stat-card-header">
            <span className="stat-card-label">Completed</span>
            <div className="stat-card-icon green"><CheckCircle2 size={18} /></div>
          </div>
          <div className="stat-card-value">{stats.completedJobs}</div>
        </div>
      </div>

      <div className="quick-actions" style={{ marginBottom: "2rem" }}>
        <Link to="/shipper/trucks" className="btn btn-secondary btn-sm">
          <Truck size={14} /> Browse Trucks
        </Link>
        <Link to="/shipper/trips" className="btn btn-secondary btn-sm">
          <MapPin size={14} /> My Trips
        </Link>
        <Link to="/payments" className="btn btn-secondary btn-sm">
          <CreditCard size={14} /> Payments
        </Link>
        <Link to="/notifications" className="btn btn-secondary btn-sm">
          <Bell size={14} /> Notifications
        </Link>
      </div>

      <div className="section-header">
        <h2 className="section-title">Active Trips</h2>
        <Link to="/shipper/trips" className="btn btn-ghost btn-sm">
          View all <ArrowRight size={14} />
        </Link>
      </div>
      {trips.filter((t) => t.status !== "completed").length === 0 ? (
        <div className="card" style={{ marginBottom: "2rem" }}>
          <div className="empty-state">
            <MapPin size={32} className="empty-state-icon" />
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
                          • <Phone size={12} style={{ display: "inline", verticalAlign: "middle" }} /> {t.transporter.phone}
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
        <Link to="/shipper/jobs/new" className="btn btn-primary btn-sm">
          <PlusCircle size={14} /> New Job
        </Link>
      </div>

      {jobs.length === 0 ? (
        <div className="card">
          <div className="empty-state">
            <Package size={32} className="empty-state-icon" />
            <p className="empty-state-text">
              No jobs yet. Create your first job to get started.
            </p>
            <Link to="/shipper/jobs/new" className="btn btn-primary" style={{ marginTop: "0.5rem" }}>
              <PlusCircle size={16} /> Create Job
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
    </div>
  );
}
