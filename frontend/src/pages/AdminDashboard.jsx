import { useState, useEffect } from "react";
import { getPlatformStats } from "../services/adminService";
import Loader from "../components/common/Loader";
import {
  Users,
  Package,
  MapPin,
  IndianRupee,
} from "lucide-react";

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    getPlatformStats()
      .then((res) => setStats(res.stats))
      .catch((err) =>
        setError(err.response?.data?.message || "Failed to load stats")
      )
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <Loader />;
  if (error) return <div className="alert alert-error">{error}</div>;

  return (
    <div className="animate-in">
      <div className="page-header">
        <div>
          <h1 className="page-title">Admin Dashboard</h1>
          <p className="page-subtitle">Platform overview and key metrics</p>
        </div>
      </div>

      <div className="stat-grid">
        <div className="stat-card stat-card-purple">
          <div className="stat-card-header">
            <span className="stat-card-label">Total Users</span>
            <div className="stat-card-icon"><Users size={18} /></div>
          </div>
          <div className="stat-card-value">{stats.totalUsers}</div>
        </div>
        <div className="stat-card stat-card-cyan">
          <div className="stat-card-header">
            <span className="stat-card-label">Total Jobs</span>
            <div className="stat-card-icon cyan"><Package size={18} /></div>
          </div>
          <div className="stat-card-value">{stats.totalJobs}</div>
        </div>
        <div className="stat-card stat-card-amber">
          <div className="stat-card-header">
            <span className="stat-card-label">Total Trips</span>
            <div className="stat-card-icon amber"><MapPin size={18} /></div>
          </div>
          <div className="stat-card-value">{stats.totalTrips}</div>
        </div>
        <div className="stat-card stat-card-green">
          <div className="stat-card-header">
            <span className="stat-card-label">Total Revenue</span>
            <div className="stat-card-icon green"><IndianRupee size={18} /></div>
          </div>
          <div className="stat-card-value">
            ₹{(stats.totalRevenue || 0).toLocaleString()}
          </div>
        </div>
      </div>
    </div>
  );
}
