import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { getShipperDashboard } from "../services/dashboardService";
import { formatDate } from "../utils/formatDate";
import Loader from "../components/common/Loader";
import { PlusCircle, Package } from "lucide-react";

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
    <div className="animate-in">
      <div className="page-header">
        <h1 className="page-title">My Jobs</h1>
        <Link to="/shipper/jobs/new" className="btn btn-primary">
          <PlusCircle size={16} /> Create Job
        </Link>
      </div>

      {jobs.length === 0 ? (
        <div className="card">
          <div className="empty-state">
            <Package size={32} className="empty-state-icon" />
            <p className="empty-state-text">No jobs yet. Create your first job to get started.</p>
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
