import { useState, useEffect } from "react";
import { getPlatformStats } from "../services/adminService";
import Loader from "../components/common/Loader";

const statCard = (label, value, color) => (
  <div key={label} className="card" style={{ flex: 1, minWidth: "160px", borderLeft: `4px solid ${color}` }}>
    <div style={{ color: "var(--color-text-muted)", fontSize: "0.875rem", marginBottom: "0.25rem" }}>{label}</div>
    <div style={{ fontSize: "1.5rem", fontWeight: 700 }}>{value}</div>
  </div>
);

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    getPlatformStats()
      .then((res) => setStats(res.stats))
      .catch((err) => setError(err.response?.data?.message || "Failed to load stats"))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <Loader />;
  if (error) return <div style={{ color: "var(--color-error)" }}>{error}</div>;

  return (
    <div>
      <h1 style={{ marginBottom: "1.5rem" }}>Admin Dashboard</h1>

      <div style={{ display: "flex", gap: "1rem", flexWrap: "wrap" }}>
        {statCard("Total Users", stats.totalUsers, "var(--color-primary)")}
        {statCard("Total Jobs", stats.totalJobs, "var(--color-accent)")}
        {statCard("Total Trips", stats.totalTrips, "var(--color-warning)")}
        {statCard("Total Revenue (₹)", stats.totalRevenue?.toLocaleString() || 0, "var(--color-success)")}
      </div>
    </div>
  );
}
