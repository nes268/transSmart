import { useState, useEffect } from "react";
import { getAllJobsAdmin, deleteJob } from "../services/adminService";
import Loader from "../components/common/Loader";
import { Package, Trash2 } from "lucide-react";

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
    <div className="animate-in">
      <div className="page-header">
        <h1 className="page-title">All Jobs</h1>
      </div>

      {jobs.length === 0 ? (
        <div className="card">
          <div className="empty-state">
            <Package size={32} className="empty-state-icon" />
            <p className="empty-state-text">No jobs</p>
          </div>
        </div>
      ) : (
        <div className="list-stack">
          {jobs.map((j) => (
            <div key={j._id} className="card card-hover">
              <div className="list-item">
                <div>
                  <div className="list-item-title">{j.title}</div>
                  <div className="list-item-sub">
                    {j.pickupLocation} → {j.deliveryLocation}
                  </div>
                  <span
                    className={`badge badge-${j.status}`}
                    style={{ marginTop: "0.25rem", display: "inline-block" }}
                  >
                    {j.status}
                  </span>
                </div>
                <div className="list-item-actions">
                  <span className="list-item-price">₹{j.price}</span>
                  <button
                    className="btn btn-danger btn-sm"
                    onClick={() => handleDelete(j._id)}
                  >
                    <Trash2 size={14} /> Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
