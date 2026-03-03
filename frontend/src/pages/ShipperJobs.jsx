import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { getShipperDashboard } from "../services/dashboardService";
import { formatDate } from "../utils/formatDate";
import Loader from "../components/common/Loader";

export default function ShipperJobs() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getShipperDashboard()
      .then((res) => setData(res.data))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <Loader />;

  const { jobs } = data;

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem" }}>
        <h1>My Jobs</h1>
        <Link to="/shipper/jobs/new" className="btn btn-primary">
          Create Job
        </Link>
      </div>

      {jobs.length === 0 ? (
        <div className="card" style={{ textAlign: "center", color: "var(--color-text-muted)" }}>
          No jobs yet. Create your first job to get started.
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
