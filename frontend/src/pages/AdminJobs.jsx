import { useState, useEffect } from "react";
import { getAllJobsAdmin, deleteJob } from "../services/adminService";
import Loader from "../components/common/Loader";

export default function AdminJobs() {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getAllJobsAdmin()
      .then((res) => setJobs(res.data || []))
      .catch(() => setJobs([]))
      .finally(() => setLoading(false));
  }, []);

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this job?")) return;
    try {
      await deleteJob(id);
      setJobs((prev) => prev.filter((j) => j._id !== id));
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) return <Loader />;

  return (
    <div>
      <h1 style={{ marginBottom: "1.5rem" }}>All Jobs</h1>

      {jobs.length === 0 ? (
        <div className="card" style={{ textAlign: "center", color: "var(--color-text-muted)" }}>No jobs</div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
          {jobs.map((j) => (
            <div key={j._id} className="card" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap" }}>
              <div>
                <div style={{ fontWeight: 600 }}>{j.title}</div>
                <div style={{ fontSize: "0.875rem", color: "var(--color-text-muted)" }}>
                  {j.pickupLocation} → {j.deliveryLocation}
                </div>
                <span className={`badge badge-${j.status}`} style={{ marginTop: "0.25rem", display: "inline-block" }}>
                  {j.status}
                </span>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                <span style={{ fontWeight: 600, color: "var(--color-primary)" }}>₹{j.price}</span>
                <button className="btn btn-danger" style={{ fontSize: "0.8125rem" }} onClick={() => handleDelete(j._id)}>
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
