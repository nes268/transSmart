import { useState, useEffect } from "react";
import { getPlatformStats, getAdvancedAnalytics } from "../services/adminService";
import Loader from "../components/common/Loader";
import {
  Users,
  Package,
  MapPin,
  IndianRupee,
  BarChart3,
} from "lucide-react";

export default function AdminStats() {
  const [stats, setStats] = useState(null);
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([getPlatformStats(), getAdvancedAnalytics()])
      .then(([sRes, aRes]) => {
        setStats(sRes.stats);
        setAnalytics(aRes.analytics);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <Loader />;

  return (
    <div className="animate-in">
      <div className="page-header">
        <div>
          <h1 className="page-title">Statistics</h1>
          <p className="page-subtitle">Platform analytics and metrics</p>
        </div>
      </div>

      <div className="stat-grid" style={{ marginBottom: "2rem" }}>
        <div className="stat-card stat-card-purple">
          <div className="stat-card-header">
            <span className="stat-card-label">Total Users</span>
            <div className="stat-card-icon"><Users size={18} /></div>
          </div>
          <div className="stat-card-value">{stats?.totalUsers || 0}</div>
        </div>
        <div className="stat-card stat-card-cyan">
          <div className="stat-card-header">
            <span className="stat-card-label">Total Jobs</span>
            <div className="stat-card-icon cyan"><Package size={18} /></div>
          </div>
          <div className="stat-card-value">{stats?.totalJobs || 0}</div>
        </div>
        <div className="stat-card stat-card-amber">
          <div className="stat-card-header">
            <span className="stat-card-label">Total Trips</span>
            <div className="stat-card-icon amber"><MapPin size={18} /></div>
          </div>
          <div className="stat-card-value">{stats?.totalTrips || 0}</div>
        </div>
        <div className="stat-card stat-card-green">
          <div className="stat-card-header">
            <span className="stat-card-label">Total Revenue</span>
            <div className="stat-card-icon green"><IndianRupee size={18} /></div>
          </div>
          <div className="stat-card-value">
            ₹{(stats?.totalRevenue || 0).toLocaleString()}
          </div>
        </div>
      </div>

      {analytics && (
        <div className="card">
          <div className="section-header" style={{ marginBottom: "1rem" }}>
            <h2 className="section-title">Advanced Analytics</h2>
            <BarChart3 size={20} style={{ color: "var(--color-text-muted)" }} />
          </div>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))",
              gap: "1rem",
            }}
          >
            <div className="stat-card stat-card-purple" style={{ marginBottom: 0 }}>
              <div className="stat-card-label">Completed Trips</div>
              <div className="stat-card-value">{analytics.completedJobs || 0}</div>
            </div>
            <div className="stat-card stat-card-cyan" style={{ marginBottom: 0 }}>
              <div className="stat-card-label">Active Transporters</div>
              <div className="stat-card-value">
                {analytics.activeTransporters || 0}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
