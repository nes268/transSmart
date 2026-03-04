import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { getAllJobs, acceptJob, completeJob } from "../services/jobService";
import { getMyTrucks } from "../services/truckService";
import { createTrip } from "../services/tripService";
import { useAuth } from "../hooks/useAuth";
import { formatDate } from "../utils/formatDate";
import Loader from "../components/common/Loader";
import { ArrowLeft, MapPin, User, Star, CheckCircle2, Phone } from "lucide-react";

export default function JobDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [job, setJob] = useState(null);
  const [trucks, setTrucks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [actionLoading, setActionLoading] = useState(false);
  const [selectedTruck, setSelectedTruck] = useState("");
  const [showAcceptModal, setShowAcceptModal] = useState(false);

  useEffect(() => {
    getAllJobs()
      .then((res) => {
        const found = res.data?.find((j) => j._id === id);
        setJob(found || null);
      })
      .catch(() => setJob(null))
      .finally(() => setLoading(false));
  }, [id]);

  useEffect(() => {
    if (user?.role === "transporter" && showAcceptModal) {
      getMyTrucks()
        .then((res) => setTrucks(res.data || []))
        .catch(() => setTrucks([]));
    }
  }, [user?.role, showAcceptModal]);

  const handleAccept = async () => {
    if (!selectedTruck) {
      setError("Please select a truck");
      return;
    }
    setError("");
    setActionLoading(true);
    try {
      await acceptJob(id);
      await createTrip(id, selectedTruck);
      setShowAcceptModal(false);
      navigate("/transporter");
    } catch (err) {
      setError(err.response?.data?.message || "Failed to accept job");
    } finally {
      setActionLoading(false);
    }
  };

  const handleComplete = async () => {
    setActionLoading(true);
    try {
      await completeJob(id);
      navigate("/transporter");
    } catch (err) {
      setError(err.response?.data?.message || "Failed to complete job");
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) return <Loader />;
  if (!job)
    return <div className="alert alert-error">Job not found</div>;

  const isShipper = user?.role === "shipper";
  const isTransporter = user?.role === "transporter";
  const canAccept = isTransporter && job.status === "open";
  const canComplete =
    isTransporter &&
    job.transporter?._id === user?._id &&
    job.status === "accepted";

  return (
    <div className="animate-in">
      <Link
        to={isShipper ? "/shipper" : isTransporter ? "/transporter" : "/admin"}
        className="back-link"
      >
        <ArrowLeft size={16} /> Back
      </Link>

      <div className="card" style={{ maxWidth: "720px" }}>
        {error && <div className="alert alert-error">{error}</div>}

        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "1.25rem" }}>
          <h1 className="page-title">{job.title}</h1>
          <span className={`badge badge-${job.status}`}>{job.status}</span>
        </div>

        <p style={{ color: "var(--color-text-muted)", marginBottom: "1.5rem", lineHeight: 1.6 }}>
          {job.description}
        </p>

        <div className="detail-grid" style={{ marginBottom: "1.5rem" }}>
          <div>
            <div className="detail-label">Pickup</div>
            <div className="detail-value" style={{ display: "flex", alignItems: "center", gap: "0.375rem" }}>
              <MapPin size={14} style={{ color: "var(--color-primary)", flexShrink: 0 }} />
              {job.pickupLocation}
            </div>
          </div>
          <div>
            <div className="detail-label">Delivery</div>
            <div className="detail-value" style={{ display: "flex", alignItems: "center", gap: "0.375rem" }}>
              <MapPin size={14} style={{ color: "var(--color-success)", flexShrink: 0 }} />
              {job.deliveryLocation}
            </div>
          </div>
        </div>

        <div style={{ marginBottom: "1.25rem" }}>
          <span
            style={{
              fontFamily: "var(--font-mono)",
              color: "var(--color-primary)",
              fontWeight: 700,
              fontSize: "1.375rem",
            }}
          >
            ₹{job.price}
          </span>
        </div>

        <div className="divider" />

        {job.shipper && (
          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.75rem", fontSize: "0.875rem" }}>
            <User size={14} style={{ color: "var(--color-text-muted)" }} />
            <span style={{ color: "var(--color-text-muted)" }}>Shipper:</span>
            <span>{job.shipper.name}</span>
            <span style={{ color: "var(--color-text-muted)" }}>({job.shipper.email})</span>
          </div>
        )}
        {job.transporter && (
          <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: "0.5rem", marginBottom: "0.75rem", fontSize: "0.875rem" }}>
            <User size={14} style={{ color: "var(--color-text-muted)" }} />
            <span style={{ color: "var(--color-text-muted)" }}>Transporter:</span>
            <span>{job.transporter.name}</span>
            {job.transporter.phone && (
              <>
                <span style={{ color: "var(--color-text-muted)" }}>•</span>
                <Phone size={12} style={{ color: "var(--color-text-muted)" }} />
                <span>{job.transporter.phone}</span>
              </>
            )}
            <span style={{ color: "var(--color-text-muted)" }}>({job.transporter.email})</span>
            <Link
              to={`/reviews/user/${job.transporter._id}`}
              className="btn btn-ghost btn-sm"
              style={{ marginLeft: "auto" }}
            >
              <Star size={14} /> Reviews
            </Link>
          </div>
        )}

        <div style={{ fontSize: "0.75rem", color: "var(--color-text-muted)", marginTop: "0.5rem" }}>
          Created {formatDate(job.createdAt)}
        </div>

        <div style={{ display: "flex", gap: "0.75rem", marginTop: "1.5rem" }}>
          {canAccept && (
            <button
              className="btn btn-primary"
              onClick={() => setShowAcceptModal(true)}
              disabled={actionLoading}
            >
              <CheckCircle2 size={16} /> Accept Job
            </button>
          )}
          {canComplete && (
            <button
              className="btn btn-primary"
              onClick={handleComplete}
              disabled={actionLoading}
            >
              {actionLoading ? "Completing..." : "Mark Complete"}
            </button>
          )}
        </div>
      </div>

      {showAcceptModal && (
        <div className="modal-overlay" onClick={() => setShowAcceptModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h3 className="modal-title">Select Truck</h3>
            {trucks.filter((t) => t.availability === "available").length === 0 ? (
              <p style={{ color: "var(--color-text-muted)", marginBottom: "1rem" }}>
                No available trucks. Add a truck first.
              </p>
            ) : (
              <>
                <div className="form-group">
                  <label>Truck</label>
                  <select
                    value={selectedTruck}
                    onChange={(e) => setSelectedTruck(e.target.value)}
                  >
                    <option value="">Choose...</option>
                    {trucks
                      .filter((t) => t.availability === "available")
                      .map((t) => (
                        <option key={t._id} value={t._id}>
                          {t.truckNumber} - {t.capacity} tons ({t.fuelType})
                        </option>
                      ))}
                  </select>
                </div>
                <div style={{ display: "flex", gap: "0.5rem" }}>
                  <button
                    className="btn btn-primary"
                    onClick={handleAccept}
                    disabled={actionLoading || !selectedTruck}
                  >
                    {actionLoading ? "Accepting..." : "Accept"}
                  </button>
                  <button
                    className="btn btn-secondary"
                    onClick={() => setShowAcceptModal(false)}
                  >
                    Cancel
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
