import { useState, useEffect } from "react";
import { getPlatformStats, getAdvancedAnalytics } from "../services/adminService";
import Loader from "../components/common/Loader";

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
    <div>
      <h1 style={{ marginBottom: "1.5rem" }}>Statistics</h1>

      <div style={{ display: "flex", gap: "1rem", flexWrap: "wrap", marginBottom: "2rem" }}>
        <div className="card" style={{ flex: 1, minWidth: "140px", borderLeft: "4px solid var(--color-primary)" }}>
          <div style={{ color: "var(--color-text-muted)", fontSize: "0.875rem" }}>Total Users</div>
          <div style={{ fontSize: "1.5rem", fontWeight: 700 }}>{stats?.totalUsers || 0}</div>
        </div>
        <div className="card" style={{ flex: 1, minWidth: "140px", borderLeft: "4px solid var(--color-accent)" }}>
          <div style={{ color: "var(--color-text-muted)", fontSize: "0.875rem" }}>Total Jobs</div>
          <div style={{ fontSize: "1.5rem", fontWeight: 700 }}>{stats?.totalJobs || 0}</div>
        </div>
        <div className="card" style={{ flex: 1, minWidth: "140px", borderLeft: "4px solid var(--color-warning)" }}>
          <div style={{ color: "var(--color-text-muted)", fontSize: "0.875rem" }}>Total Trips</div>
          <div style={{ fontSize: "1.5rem", fontWeight: 700 }}>{stats?.totalTrips || 0}</div>
        </div>
        <div className="card" style={{ flex: 1, minWidth: "140px", borderLeft: "4px solid var(--color-success)" }}>
          <div style={{ color: "var(--color-text-muted)", fontSize: "0.875rem" }}>Total Revenue (₹)</div>
          <div style={{ fontSize: "1.5rem", fontWeight: 700 }}>{(stats?.totalRevenue || 0).toLocaleString()}</div>
        </div>
      </div>

      {analytics && (
        <div className="card">
          <h2 style={{ fontSize: "1.125rem", marginBottom: "1rem" }}>Advanced Analytics</h2>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: "1rem" }}>
            <div>
              <div style={{ color: "var(--color-text-muted)", fontSize: "0.875rem" }}>Completed Trips</div>
              <div style={{ fontWeight: 600 }}>{analytics.completedJobs || 0}</div>
            </div>
            <div>
              <div style={{ color: "var(--color-text-muted)", fontSize: "0.875rem" }}>Active Transporters</div>
              <div style={{ fontWeight: 600 }}>{analytics.activeTransporters || 0}</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
