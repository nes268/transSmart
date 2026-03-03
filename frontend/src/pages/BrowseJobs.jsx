import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { getAllJobs } from "../services/jobService";
import { formatDate } from "../utils/formatDate";
import Loader from "../components/common/Loader";
import { Package } from "lucide-react";

export default function BrowseJobs() {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("open");

  useEffect(() => {
    setLoading(true);
    getAllJobs({ status: filter })
      .then((res) => setJobs(res.data || []))
      .catch(() => setJobs([]))
      .finally(() => setLoading(false));
  }, [filter]);

  const openJobs = jobs.filter((j) => j.status === "open");

  return (
    <div className="animate-in">
      <div className="page-header">
        <h1 className="page-title">Browse Jobs</h1>
        <div className="tab-group">
          <button
            className={`tab-btn${filter === "open" ? " active" : ""}`}
            onClick={() => setFilter("open")}
          >
            Open
          </button>
          <button
            className={`tab-btn${filter === "" ? " active" : ""}`}
            onClick={() => setFilter("")}
          >
            All
          </button>
        </div>
      </div>

      {loading ? (
        <Loader />
      ) : openJobs.length === 0 ? (
        <div className="card">
          <div className="empty-state">
            <Package size={32} className="empty-state-icon" />
            <p className="empty-state-text">No open jobs at the moment. Check back later.</p>
          </div>
        </div>
      ) : (
        <div className="list-stack">
          {openJobs.map((job) => (
            <Link key={job._id} to={`/jobs/${job._id}`} className="card card-hover card-interactive">
              <div className="list-item">
                <div>
                  <div className="list-item-title">{job.title}</div>
                  <div className="list-item-sub">
                    {job.pickupLocation} → {job.deliveryLocation}
                  </div>
                  <div className="list-item-meta">
                    {job.shipper?.name && `by ${job.shipper.name}`} •{" "}
                    {formatDate(job.createdAt)}
                  </div>
                </div>
                <div className="list-item-actions">
                  <span className="badge badge-open">Open</span>
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
