import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { getAllTrucks } from "../services/truckService";
import { createTruckRequest } from "../services/truckRequestService";
import { getAllJobs } from "../services/jobService";
import Loader from "../components/common/Loader";
import { Truck, User, Phone, Send } from "lucide-react";

export default function BrowseTrucks() {
  const [trucks, setTrucks] = useState([]);
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  const [requestModal, setRequestModal] = useState(null);
  const [requestJobId, setRequestJobId] = useState("");
  const [requestMessage, setRequestMessage] = useState("");
  const [requestLoading, setRequestLoading] = useState(false);
  const [requestError, setRequestError] = useState("");

  useEffect(() => {
    setLoading(true);
    Promise.all([
      getAllTrucks().then((res) => (Array.isArray(res?.data) ? res.data : [])),
      getAllJobs({ mine: "true", status: "open" }).then((res) => (Array.isArray(res?.data) ? res.data : [])),
    ])
      .then(([truckList, jobList]) => {
        setTrucks(truckList);
        setJobs(jobList);
      })
      .catch(() => setTrucks([]))
      .finally(() => setLoading(false));
  }, []);

  const filteredTrucks =
    filter === "all"
      ? trucks
      : trucks.filter((t) => t.availability === filter);

  const openRequestModal = (truck) => {
    setRequestModal(truck);
    setRequestJobId("");
    setRequestMessage("");
    setRequestError("");
  };

  const handleSendRequest = async (e) => {
    e.preventDefault();
    if (!requestModal || !requestJobId) return;
    setRequestError("");
    setRequestLoading(true);
    try {
      await createTruckRequest(requestModal._id, requestJobId, requestMessage);
      setRequestModal(null);
    } catch (err) {
      setRequestError(err.response?.data?.message || "Failed to send request");
    } finally {
      setRequestLoading(false);
    }
  };

  return (
    <div className="animate-in">
      <div className="page-header">
        <h1 className="page-title">Browse Trucks</h1>
        <p className="page-subtitle">View all available truck profiles</p>
        <div className="tab-group">
          <button
            className={`tab-btn${filter === "all" ? " active" : ""}`}
            onClick={() => setFilter("all")}
          >
            All
          </button>
          <button
            className={`tab-btn${filter === "available" ? " active" : ""}`}
            onClick={() => setFilter("available")}
          >
            Available
          </button>
          <button
            className={`tab-btn${filter === "busy" ? " active" : ""}`}
            onClick={() => setFilter("busy")}
          >
            Busy
          </button>
        </div>
      </div>

      {loading ? (
        <Loader />
      ) : filteredTrucks.length === 0 ? (
        <div className="card">
          <div className="empty-state">
            <Truck size={32} className="empty-state-icon" />
            <p className="empty-state-text">
              {filter === "all"
                ? "No trucks registered yet. Check back later."
                : `No ${filter} trucks at the moment.`}
            </p>
          </div>
        </div>
      ) : (
        <div className="list-stack">
          {filteredTrucks.map((t) => (
            <div key={t._id} className="card card-hover">
              <div className="list-item">
                <div>
                  <div className="list-item-title">{t.truckNumber}</div>
                  <div className="list-item-sub">
                    {t.capacity} tons • {t.fuelType?.charAt(0).toUpperCase() + (t.fuelType?.slice(1) || "")}
                  </div>
                  <div className="list-item-meta">
                    {t.transporter?.name && (
                      <>
                        <User size={14} style={{ display: "inline", verticalAlign: "middle", marginRight: "4px" }} />
                        {t.transporter.name}
                        {t.transporter.phone && (
                          <>
                            <span style={{ margin: "0 0.25rem" }}>•</span>
                            <Phone size={12} style={{ display: "inline", verticalAlign: "middle", marginRight: "2px" }} />
                            {t.transporter.phone}
                          </>
                        )}
                        {t.transporter.email && (
                          <span style={{ opacity: 0.8 }}> • {t.transporter.email}</span>
                        )}
                      </>
                    )}
                  </div>
                </div>
                <div className="list-item-actions">
                  <span
                    className={`badge badge-${t.availability === "available" ? "completed" : "accepted"}`}
                  >
                    {t.availability}
                  </span>
                  <button
                    className="btn btn-primary btn-sm"
                    onClick={() => openRequestModal(t)}
                  >
                    <Send size={14} /> Request
                  </button>
                  {t.transporter?._id && (
                    <Link
                      to={`/reviews/user/${t.transporter._id}`}
                      className="btn btn-secondary btn-sm"
                    >
                      View Profile
                    </Link>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {requestModal && (
        <div className="modal-overlay" onClick={() => setRequestModal(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h3 className="modal-title">Send Request</h3>
            <p style={{ color: "var(--color-text-muted)", marginBottom: "1rem", fontSize: "0.875rem" }}>
              Request truck <strong>{requestModal.truckNumber}</strong> from {requestModal.transporter?.name}
            </p>
            {requestError && <div className="alert alert-error">{requestError}</div>}
            <form onSubmit={handleSendRequest}>
              <div className="form-group">
                <label>Select Job (required)</label>
                <select
                  value={requestJobId}
                  onChange={(e) => setRequestJobId(e.target.value)}
                  required
                >
                  <option value="">Choose a job...</option>
                  {jobs.map((j) => (
                    <option key={j._id} value={j._id}>
                      {j.title} — {j.pickupLocation} → {j.deliveryLocation}
                    </option>
                  ))}
                </select>
                {jobs.length === 0 && (
                  <span style={{ fontSize: "0.8125rem", color: "var(--color-text-muted)" }}>
                    You have no open jobs. Create a job first.
                  </span>
                )}
              </div>
              <div className="form-group">
                <label>Message (optional)</label>
                <textarea
                  value={requestMessage}
                  onChange={(e) => setRequestMessage(e.target.value)}
                  placeholder="Add a note for the transporter..."
                  rows={3}
                  style={{ resize: "vertical" }}
                />
              </div>
              <div style={{ display: "flex", gap: "0.5rem" }}>
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={requestLoading || !requestJobId || jobs.length === 0}
                >
                  {requestLoading ? "Sending..." : "Send Request"}
                </button>
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setRequestModal(null)}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
