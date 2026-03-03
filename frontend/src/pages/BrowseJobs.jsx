import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { getAllJobs } from "../services/jobService";
import { formatDate } from "../utils/formatDate";
import Loader from "../components/common/Loader";

export default function BrowseJobs() {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("open");

  useEffect(() => {
    getAllJobs({ status: filter })
      .then((res) => setJobs(res.data || []))
      .catch(() => setJobs([]))
      .finally(() => setLoading(false));
  }, [filter]);

  if (loading) return <Loader />;

  const openJobs = jobs.filter((j) => j.status === "open");

  return (
    <div>
      <h1 style={{ marginBottom: "1rem" }}>Browse Jobs</h1>
      <div style={{ marginBottom: "1rem" }}>
        <select
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          style={{
            padding: "0.5rem 1rem",
            background: "var(--color-surface)",
            border: "1px solid var(--color-border)",
            borderRadius: "var(--radius)",
            color: "var(--color-text)",
          }}
        >
          <option value="open">Open</option>
          <option value="">All</option>
        </select>
      </div>

      {openJobs.length === 0 ? (
        <div className="card" style={{ textAlign: "center", color: "var(--color-text-muted)" }}>
          No open jobs at the moment. Check back later.
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
          {openJobs.map((job) => (
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
                    {job.shipper?.name && `by ${job.shipper.name}`} • {formatDate(job.createdAt)}
                  </div>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                  <span className="badge badge-open">Open</span>
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
